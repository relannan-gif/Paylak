import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { useStore, type Draft } from "./store";
import {
  Icon,
  Mark,
  Txt,
  Row,
  Panel,
  Button,
  Cell,
  Field,
  Tag,
  CardArt,
} from "./ui";
import {
  available,
  cancelReservation,
  money,
  parseAmount,
  transact,
  initialLedger,
  type Transaction,
} from "./domain";

const tabs = [
  ["home", "home", "Home", "الرئيسية"],
  ["payments", "swap", "Payments", "المدفوعات"],
  ["cards", "card", "Cards", "البطاقات"],
  ["cash", "cash", "Cash", "النقد"],
  ["services", "services", "Services", "الخدمات"],
];
const contacts = [
  ["Sara Haddad", "سارة حداد", "SH"],
  ["Karim Nassar", "كريم نصّار", "KN"],
  ["Maya Khoury", "مايا خوري", "MK"],
];
const agents = [
  ["Hazmieh", "الحازمية", "0.8 km", "9:00–19:00"],
  ["Achrafieh", "الأشرفية", "3.1 km", "9:00–21:00"],
  ["Hamra", "الحمرا", "6.5 km", "9:00–20:00"],
];
let sequence = 2000;
export function PaylakScreen({ name }: { name: string }) {
  const s = useStore();
  const { choice } = useLocalSearchParams<{ choice?: string }>();
  const { t, theme, rtl, ledger } = s;
  const { width } = useWindowDimensions();
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(
    choice ? Math.max(0, Math.min(2, Number(choice) || 0)) : 0,
  );
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState(0);
  const [filter, setFilter] = useState("all");
  const [service, setService] = useState("Alfa");
  const [phone, setPhone] = useState("");
  const [request, setRequest] = useState("");
  const [time, setTime] = useState(() => Date.now());
  const busy = useRef(false);
  useEffect(() => {
    if (name !== "review") return;
    const id = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(id);
  }, [name]);
  const go = (page: string, choice?: number) =>
    router.push({
      pathname: "/screen/[name]",
      params: {
        name: page,
        ...(choice === undefined ? {} : { choice: String(choice) }),
      },
    });
  const main = tabs.some((x) => x[0] === name);
  const fail = (key: string) =>
    setError(
      key === "insufficient"
        ? t(
            "Not enough available USD. Reduce the amount or add money.",
            "الرصيد المتاح غير كافٍ. خفّض المبلغ أو أضف المال.",
          )
        : t(
            "Enter a valid amount with up to two decimal places.",
            "أدخل مبلغاً صحيحاً بمنزلتين عشريتين كحد أقصى.",
          ),
    );
  const makeDraft = (
    type: Draft["type"],
    label: string,
    labelAr: string,
    fixed?: number,
  ) => {
    const value = fixed ?? parseAmount(amount);
    if (!value) {
      fail("invalidAmount");
      return;
    }
    const fee = type === "reserve" ? Math.max(50, Math.ceil(value / 200)) : 0;
    if (value + fee > available(ledger)) {
      fail("insufficient");
      return;
    }
    if (s.scenario === "offline") {
      setError(
        t(
          "You’re offline. No money has moved. Reconnect before requesting a quote.",
          "أنت غير متصل. لم تتحرك أي أموال. اتصل قبل طلب السعر.",
        ),
      );
      return;
    }
    s.setDraft({
      type,
      label,
      labelAr,
      amount: value,
      fee,
      key: `PL-DEMO-${++sequence}`,
      expires: Date.now() + 120000,
    });
    go("review");
  };
  const confirm = () => {
    const d = s.draft;
    if (!d || busy.current) return;
    if (Date.now() > d.expires) {
      setError(
        t(
          "This quote expired. Go back for a fresh quote.",
          "انتهت صلاحية السعر. ارجع لطلب سعر جديد.",
        ),
      );
      return;
    }
    if (s.scenario === "offline") {
      setError(
        t(
          "No connection. Confirmation has not been sent.",
          "لا يوجد اتصال. لم يُرسل التأكيد.",
        ),
      );
      return;
    }
    if (s.scenario === "declined") {
      go("failed");
      return;
    }
    if (s.scenario === "pending") {
      go("pending");
      return;
    }
    busy.current = true;
    try {
      const next = transact(ledger, d);
      s.setLedger(next);
      s.setReceipt(next.transactions.find((x) => x.id === d.key) || null);
      go("receipt");
    } catch (e) {
      busy.current = false;
      fail((e as Error).message);
    }
  };
  const section = (en: string, ar: string, action?: () => void) => (
    <Row style={{ justifyContent: "space-between", marginTop: 14 }}>
      <Txt size={18} weight="600">
        {t(en, ar)}
      </Txt>
      {action && (
        <Pressable
          accessibilityRole="button"
          onPress={action}
          style={{ padding: 10, minHeight: 44 }}
        >
          <Txt size={13} style={{ color: theme.accent }}>
            {t("See all", "عرض الكل")}
          </Txt>
        </Pressable>
      )}
    </Row>
  );
  const notice = (en: string, ar: string) => (
    <Panel style={{ backgroundColor: theme.soft }}>
      <Row>
        <Icon name="help" color={theme.accent} />
        <View style={{ flex: 1 }}>
          <Txt size={13}>{t(en, ar)}</Txt>
        </View>
      </Row>
    </Panel>
  );
  const err = error ? <Txt style={{ color: theme.danger }}>{error}</Txt> : null;
  const transaction = (tx: Transaction) => (
    <Cell
      key={tx.id}
      icon={
        tx.kind === "received"
          ? "arrow"
          : tx.kind === "card"
            ? "card"
            : tx.kind === "cash"
              ? "cash"
              : "receipt"
      }
      title={tx.label}
      sub={`${tx.date} · ${tx.status === "reserved" ? t("Reserved", "محجوز") : tx.status === "cancelled" ? t("Cancelled", "ملغاة") : t("Completed", "مكتملة")}`}
      right={`${tx.amount > 0 ? "+" : ""}${money(tx.amount)}`}
      onPress={() => {
        s.setReceipt(tx);
        go("receipt");
      }}
    />
  );
  const quick = (
    icon: string,
    en: string,
    ar: string,
    dest: string,
    primary = false,
    action?: () => void,
  ) => (
    <Pressable
      key={en}
      accessibilityRole="button"
      accessibilityLabel={t(en, ar)}
      onPress={action || (() => go(dest))}
      style={{ flex: 1, alignItems: "center", gap: 10, minHeight: 88 }}
    >
      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 17,
          backgroundColor: primary ? theme.button : theme.elevated,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} color={primary ? "#FFFFFF" : theme.text} />
      </View>
      <Txt size={12} weight="500">
        {t(en, ar)}
      </Txt>
    </Pressable>
  );
  const titles: Record<string, [string, string]> = {
    home: ["Your everyday money", "أموالك اليومية"],
    payments: ["Move money", "حرّك أموالك"],
    cards: ["Your cards", "بطاقاتك"],
    cash: ["Cash, with certainty", "نقد، بكل وضوح"],
    services: ["Everyday & away", "ليومك ولسفرك"],
    send: ["Send money", "أرسل المال"],
    request: ["Request money", "اطلب المال"],
    review: ["Review payment", "راجع العملية"],
    receipt: ["Transaction details", "تفاصيل العملية"],
    add: ["Add money", "أضف المال"],
    load: ["Fund your card", "موّل بطاقتك"],
    activity: ["Activity", "النشاط"],
    profile: ["Your account", "حسابك"],
    support: ["We’re here", "نحن هنا"],
    onboarding: ["Welcome to PAYLAK", "أهلاً بك في بايلاك"],
    reserve: ["Reserve cash", "احجز النقد"],
    topup: ["Mobile top-up", "شحن الهاتف"],
    esim: ["Travel connected", "ابقَ متصلاً"],
    bills: ["Bills & subscriptions", "الفواتير والاشتراكات"],
    usdt: ["USDT access", "خدمة USDT"],
    pockets: ["Your pockets", "مساحاتك"],
    business: ["PAYLAK Business", "بايلاك للأعمال"],
    international: ["Across borders", "عبر الحدود"],
    limits: ["Card limits", "حدود البطاقة"],
    notifications: ["Updates", "التحديثات"],
    pending: ["Payment pending", "العملية قيد الانتظار"],
    failed: ["Payment not completed", "لم تكتمل العملية"],
    security: ["Security & recovery", "الأمان والاسترداد"],
  };
  const header = titles[name] || ["PAYLAK", "بايلاك"];
  let content: React.ReactNode;
  switch (name) {
    case "home":
      content = (
        <>
          <Row style={{ justifyContent: "space-between" }}>
            <View>
              <Txt muted size={13}>
                {t("Good afternoon,", "مساء الخير،")}
              </Txt>
              <Txt size={26} weight="600">
                {t("Rayan", "ريان")}
              </Txt>
            </View>
            <Pressable
              onPress={() => go("notifications")}
              accessibilityRole="button"
              accessibilityLabel={t("Notifications", "الإشعارات")}
              style={{ padding: 12 }}
            >
              <Icon name="bell" />
            </Pressable>
          </Row>
          <View style={{ paddingVertical: 14, gap: 6 }}>
            <Row>
              <Txt muted>
                {t("Available USD wallet", "رصيد محفظة USD المتاح")}
              </Txt>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t(
                  "Toggle balance visibility",
                  "إظهار أو إخفاء الرصيد",
                )}
                onPress={() => s.setHidden(!s.hidden)}
                style={{ padding: 12 }}
              >
                <Icon name="eye" size={19} color={theme.muted} />
              </Pressable>
            </Row>
            <Txt
              size={44}
              weight="500"
              style={{
                letterSpacing: -1.8,
                writingDirection: "ltr",
                textAlign: rtl ? "right" : "left",
              }}
            >
              {s.hidden ? "••••••" : money(available(ledger))}
            </Txt>
            <Row style={{ justifyContent: "space-between", marginTop: 10 }}>
              <Txt muted size={13}>
                {t("Lebanese pounds", "الليرة اللبنانية")}
              </Txt>
              <Txt size={14} style={{ writingDirection: "ltr" }}>
                {s.hidden ? "••••" : "LBP 8,950,000"}
              </Txt>
            </Row>
            {ledger.held > 0 && (
              <Txt size={12} muted>
                {t("Reserved for cash: ", "محجوز للنقد: ") + money(ledger.held)}
              </Txt>
            )}
          </View>
          <Row style={{ marginVertical: 8 }}>
            {quick("send", "Send", "إرسال", "send", true)}
            {quick("add", "Add money", "إضافة", "add")}
            {quick("cash", "Get cash", "سحب نقدي", "cash")}
            {quick("receipt", "Request", "طلب", "request")}
          </Row>
          <Pressable accessibilityRole="button" onPress={() => go("cards")}>
            <Panel>
              <Row style={{ justifyContent: "space-between" }}>
                <Row>
                  <Icon name="card" color={theme.accent} />
                  <Txt>{t("Card balance", "رصيد البطاقة")}</Txt>
                </Row>
                <Txt weight="600">{s.hidden ? "••••" : money(ledger.card)}</Txt>
              </Row>
              <Txt size={12} muted>
                {t(
                  "Separate from your wallet. Ready for card spending.",
                  "منفصل عن المحفظة. جاهز للإنفاق بالبطاقة.",
                )}
              </Txt>
            </Panel>
          </Pressable>
          <Cell
            icon="cash"
            title={t("Cash close to you", "النقد قريب منك")}
            sub={t(
              "Choose an amount. Check availability before travelling.",
              "اختر المبلغ وتحقّق من التوفر قبل الذهاب.",
            )}
            onPress={() => go("cash")}
          />
          {section("Recent activity", "آخر العمليات", () => go("activity"))}
          <View>{ledger.transactions.slice(0, 3).map(transaction)}</View>
          <Row>
            <View style={{ flex: 1 }}>
              <Cell
                icon="pocket"
                title={t("Pockets", "مساحات")}
                onPress={() => go("pockets")}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Cell icon="globe" title="eSIM" onPress={() => go("esim")} />
            </View>
          </Row>
        </>
      );
      break;
    case "payments":
      content = (
        <>
          <Txt muted>
            {t("For your people. For your plans.", "لناسك ولمخططاتك.")}
          </Txt>
          {section("Your people", "جهات الاتصال")}
          <Row style={{ justifyContent: "space-around" }}>
            {contacts.map((c, i) => (
              <Pressable
                key={c[0]}
                accessibilityRole="button"
                onPress={() => {
                  go("send", i);
                }}
                style={{ alignItems: "center", gap: 8, padding: 8 }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: theme.elevated,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Txt weight="600">{c[2]}</Txt>
                </View>
                <Txt size={12}>{t(c[0].split(" ")[0], c[1].split(" ")[0])}</Txt>
              </Pressable>
            ))}
          </Row>
          <View>
            <Cell
              icon="send"
              title={t("Send to a person", "أرسل إلى شخص")}
              sub={t(
                "Review the recipient and full price",
                "راجع المستلم والسعر الكامل",
              )}
              onPress={() => go("send")}
            />
            <Cell
              icon="receipt"
              title={t("Request money", "اطلب المال")}
              sub={t(
                "Create a request for someone you know",
                "أنشئ طلباً لشخص تعرفه",
              )}
              onPress={() => go("request")}
            />
            <Cell
              icon="globe"
              title={t("International transfers", "التحويلات الدولية")}
              sub={t("Routes and delivery options", "المسارات وطرق الاستلام")}
              onPress={() => go("international")}
            />
            <Cell
              icon="phone"
              title={t("Bills & subscriptions", "الفواتير والاشتراكات")}
              onPress={() => go("bills")}
            />
            <Cell
              icon="clock"
              title={t("All activity", "كل العمليات")}
              onPress={() => go("activity")}
            />
          </View>
        </>
      );
      break;
    case "send":
      content = (
        <>
          <Txt muted>{t("Who are you sending to?", "لمن تريد الإرسال؟")}</Txt>
          <Field
            label={t("Search people", "ابحث عن شخص")}
            value={search}
            onChange={setSearch}
            placeholder={t("Name", "الاسم")}
          />
          {contacts.map((c, i) =>
            c.join(" ").toLowerCase().includes(search.toLowerCase()) ? (
              <Pressable
                key={c[0]}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected === i }}
                onPress={() => setSelected(i)}
                style={{
                  padding: 16,
                  borderWidth: 1,
                  borderColor: selected === i ? theme.accent : theme.line,
                  borderRadius: 12,
                }}
              >
                <Row style={{ justifyContent: "space-between" }}>
                  <Txt>{t(c[0], c[1])}</Txt>
                  {selected === i && <Icon name="check" color={theme.accent} />}
                </Row>
              </Pressable>
            ) : null,
          )}
          {!contacts.some((c) =>
            c.join(" ").toLowerCase().includes(search.toLowerCase()),
          ) && (
            <Txt muted>
              {t(
                "No matching sample contact. Clear the search to choose one.",
                "لا توجد جهة مطابقة. امسح البحث لاختيار جهة.",
              )}
            </Txt>
          )}
          <Field
            label={t("Amount in USD", "المبلغ بالدولار")}
            value={amount}
            onChange={setAmount}
            numeric
            testID="amount-input"
          />
          <Txt size={12} muted>
            {t("Available: ", "المتاح: ") + money(available(ledger))}
          </Txt>
          <Field
            label={t("Note (optional)", "ملاحظة (اختياري)")}
            value={note}
            onChange={setNote}
          />
          {err}
          <Button
            label={t("Review transfer", "راجع التحويل")}
            onPress={() =>
              makeDraft("send", contacts[selected][0], contacts[selected][1])
            }
          />
        </>
      );
      break;
    case "request":
      content = (
        <>
          <Txt muted>
            {t(
              "Let someone know what they owe you. A request never moves money automatically.",
              "أخبر شخصاً بالمبلغ المطلوب. الطلب لا ينقل المال تلقائياً.",
            )}
          </Txt>
          <Field
            label={t("Amount in USD", "المبلغ بالدولار")}
            numeric
            value={amount}
            onChange={setAmount}
          />
          <Field
            label={t("What is it for?", "لأي غرض؟")}
            value={note}
            onChange={setNote}
          />
          {err}
          <Button
            label={t("Create sample request", "أنشئ طلباً تجريبياً")}
            onPress={() => {
              const a = parseAmount(amount);
              if (!a) {
                fail("invalidAmount");
                return;
              }
              setRequest(
                `${t("Request", "طلب")} ${money(a)} · DEMO-${++sequence}`,
              );
            }}
          />
          {request && (
            <Panel>
              <Icon name="check" color={theme.positive} />
              <Txt weight="600">{request}</Txt>
              <Txt>{note}</Txt>
              <Txt size={12} muted>
                {t(
                  "Preview only. No payment link has been issued or sent.",
                  "معاينة فقط. لم يُنشأ أو يُرسل رابط دفع.",
                )}
              </Txt>
            </Panel>
          )}
        </>
      );
      break;
    case "cards":
      content = (
        <>
          <Row style={{ justifyContent: "space-between" }}>
            <Tag label={t("Virtual · •••• 2048", "افتراضية · •••• 2048")} />
            <Txt size={12} muted>
              {t("Sample card", "بطاقة تجريبية")}
            </Txt>
          </Row>
          <CardArt />
          <Panel>
            <Txt size={13} muted>
              {t("Available card funds", "أموال البطاقة المتاحة")}
            </Txt>
            <Txt size={32} weight="500">
              {money(ledger.card)}
            </Txt>
            <Button
              label={t("Add card funds", "أضف أموالاً للبطاقة")}
              onPress={() => go("load")}
            />
          </Panel>
          <Row>
            {quick(
              "freeze",
              s.frozen ? "Unfreeze" : "Freeze",
              s.frozen ? "إلغاء التجميد" : "تجميد",
              "cards",
              false,
              () => s.setFrozen(!s.frozen),
            )}
            {quick("services", "Limits", "الحدود", "limits")}
            {quick("help", "Get help", "مساعدة", "support")}
          </Row>
          <Row style={{ justifyContent: "space-between" }}>
            <Txt>{t("Freeze card", "تجميد البطاقة")}</Txt>
            <Switch
              accessibilityLabel={t("Freeze card", "تجميد البطاقة")}
              value={s.frozen}
              onValueChange={s.setFrozen}
              trackColor={{ true: theme.button }}
            />
          </Row>
          <Row style={{ justifyContent: "space-between" }}>
            <Txt>{t("Online payments", "المدفوعات عبر الإنترنت")}</Txt>
            <Switch
              accessibilityLabel={t(
                "Online payments",
                "المدفوعات عبر الإنترنت",
              )}
              value={s.online}
              onValueChange={s.setOnline}
              trackColor={{ true: theme.button }}
            />
          </Row>
          <Cell
            icon="clock"
            title={t("Monthly spending", "الإنفاق الشهري")}
            right={`$420 / ${money(s.cardLimit)}`}
            onPress={() => go("limits")}
          />
          <Cell
            icon="receipt"
            title={t("Card activity & refunds", "عمليات البطاقة والاسترداد")}
            onPress={() => go("activity")}
          />
          {notice(
            "Card controls are simulated here. No card has been issued.",
            "التحكم بالبطاقة تجريبي هنا. لم تُصدر أي بطاقة.",
          )}
        </>
      );
      break;
    case "limits":
      content = (
        <>
          <Txt muted>
            {t(
              "Set a personal monthly spending cap for your card.",
              "حدّد سقفاً شهرياً شخصياً للإنفاق بالبطاقة.",
            )}
          </Txt>
          <Field
            label={t("Monthly limit in USD", "الحد الشهري بالدولار")}
            value={amount}
            onChange={setAmount}
            numeric
            placeholder={String(s.cardLimit / 100)}
          />
          {err}
          <Button
            label={t("Save limit", "احفظ الحد")}
            onPress={() => {
              const a = parseAmount(amount);
              if (!a || a < 42000 || a > 500000) {
                setError(
                  t(
                    "Choose a demo limit between $420 already spent and $5,000.",
                    "اختر حداً تجريبياً بين 420 دولاراً منفقة و5,000 دولار.",
                  ),
                );
                return;
              }
              s.setCardLimit(a);
              setRequest(
                t(
                  "Limit updated for this demo session.",
                  "تم تحديث الحد لهذه الجلسة التجريبية.",
                ),
              );
            }}
          />
          {request && notice(request, request)}
        </>
      );
      break;
    case "load":
    case "pockets":
      content = (
        <>
          {name === "pockets" && (
            <Panel>
              <Icon name="pocket" color={theme.accent} />
              <Txt weight="600">{t("A little set aside", "مبلغ على جنب")}</Txt>
              <Txt size={34}>{money(ledger.pocket)}</Txt>
              <Txt muted size={13}>
                {t(
                  "Your travel pocket · no interest or investment return",
                  "مساحة السفر · بدون فوائد أو عائد استثماري",
                )}
              </Txt>
            </Panel>
          )}
          <Txt muted>
            {name === "load"
              ? t(
                  "Move USD from your wallet to your separate card balance.",
                  "انقل الدولارات من محفظتك إلى رصيد البطاقة المنفصل.",
                )
              : t(
                  "Move money out of your available wallet into your travel pocket.",
                  "انقل المال من رصيدك المتاح إلى مساحة السفر.",
                )}
          </Txt>
          <Field
            label={t("Amount in USD", "المبلغ بالدولار")}
            value={amount}
            onChange={setAmount}
            numeric
          />
          {err}
          <Button
            label={t("Review transfer", "راجع التحويل")}
            onPress={() =>
              makeDraft(
                name === "load" ? "load" : "pocket",
                name === "load" ? "Card •••• 2048" : "Travel pocket",
                name === "load" ? "البطاقة •••• 2048" : "مساحة السفر",
              )
            }
          />
        </>
      );
      break;
    case "cash":
      content = (
        <>
          <Txt muted>
            {t(
              "A nearby location is useful. A confirmed amount is better.",
              "الموقع القريب مفيد. والمبلغ المؤكد أفضل.",
            )}
          </Txt>
          <Panel style={{ backgroundColor: theme.soft }}>
            <Row>
              <Icon name="cash" color={theme.accent} />
              <View style={{ flex: 1 }}>
                <Txt weight="600">
                  {t("Know before you go", "تأكّد قبل ما تروح")}
                </Txt>
                <Txt muted size={13}>
                  {t(
                    "Request → agent confirmation → collection window",
                    "طلب ← تأكيد الوكيل ← موعد الاستلام",
                  )}
                </Txt>
              </View>
            </Row>
          </Panel>
          <Field
            label={t("Find a cash point", "ابحث عن نقطة نقد")}
            value={search}
            onChange={setSearch}
            placeholder={t("City or neighbourhood", "المدينة أو المنطقة")}
          />
          <Tag
            label={t(
              "Illustrative locations · not an operating network",
              "مواقع توضيحية · ليست شبكة تشغيلية",
            )}
          />
          <View>
            {agents
              .filter((a) =>
                a.join(" ").toLowerCase().includes(search.toLowerCase()),
              )
              .map((a) => (
                <Cell
                  key={a[0]}
                  icon="cash"
                  title={t(a[0], a[1])}
                  sub={`${a[2]} · ${a[3]}`}
                  onPress={() => {
                    go("reserve", agents.indexOf(a));
                  }}
                />
              ))}
          </View>
          {!agents.some((a) =>
            a.join(" ").toLowerCase().includes(search.toLowerCase()),
          ) && (
            <Txt muted>
              {t(
                "No sample locations match your search.",
                "لا توجد مواقع تجريبية مطابقة.",
              )}
            </Txt>
          )}
          <Button
            label={t("Request a cash reservation", "اطلب حجز النقد")}
            onPress={() => go("reserve")}
          />
          {ledger.transactions
            .filter((x) => x.status === "reserved")
            .map(transaction)}
          <Cell
            icon="add"
            title={t("Add cash instead", "إيداع نقدي")}
            onPress={() => {
              go("add");
            }}
          />
        </>
      );
      break;
    case "reserve":
      content = (
        <>
          <Txt muted>
            {t(
              "Choose the location and the cash you want to collect.",
              "اختر الموقع والمبلغ الذي تريد استلامه.",
            )}
          </Txt>
          {agents.map((a, i) => (
            <Pressable
              key={a[0]}
              onPress={() => setSelected(i)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === i }}
              style={{
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: selected === i ? theme.accent : theme.line,
              }}
            >
              <Row style={{ justifyContent: "space-between" }}>
                <Txt>{t(a[0], a[1])}</Txt>
                <Txt muted size={12}>
                  {a[3]}
                </Txt>
                {selected === i && <Icon name="check" color={theme.accent} />}
              </Row>
            </Pressable>
          ))}
          <Field
            label={t("Cash amount in USD", "المبلغ النقدي بالدولار")}
            value={amount}
            onChange={setAmount}
            numeric
          />
          {notice(
            "Example pricing: 0.5%, minimum $0.50. Final commercial fees are not set. No funds are held until simulated agent acceptance.",
            "تسعير توضيحي: 0.5%، بحد أدنى 0.50 دولار. الرسوم النهائية غير محددة. لا يُحجز المال قبل محاكاة قبول الوكيل.",
          )}
          {err}
          <Button
            label={t("Review cash request", "راجع طلب النقد")}
            onPress={() =>
              makeDraft("reserve", agents[selected][0], agents[selected][1])
            }
          />
        </>
      );
      break;
    case "add":
      content = (
        <>
          <Txt muted>
            {t(
              "Choose how money reaches your wallet.",
              "اختر كيف تصل الأموال إلى محفظتك.",
            )}
          </Txt>
          <Cell
            icon="cash"
            title={t("Add cash at an agent", "أودع النقد لدى وكيل")}
            sub={t("View the deposit journey", "اعرض خطوات الإيداع")}
            onPress={() => setStep(1)}
          />
          <Cell
            icon="card"
            title={t("From a bank card", "من بطاقة مصرفية")}
            sub={t(
              "Review fees before adding money",
              "راجع الرسوم قبل الإيداع",
            )}
            onPress={() => setStep(2)}
          />
          <Cell
            icon="business"
            title={t("Bank transfer", "تحويل مصرفي")}
            onPress={() => setStep(3)}
          />
          <Cell
            icon="globe"
            title={t("USDT", "USDT")}
            sub={t("Availability to be confirmed", "التوفر قيد التأكيد")}
            onPress={() => go("usdt")}
          />
          {step === 1 && (
            <Panel>
              <Txt weight="600">
                {t("Cash deposit preview", "معاينة الإيداع النقدي")}
              </Txt>
              <Txt>
                {t(
                  "Choose an approved agent, show your deposit reference, hand over cash and wait for confirmed wallet credit before leaving.",
                  "اختر وكيلاً معتمداً، أبرز مرجع الإيداع وسلّم النقد وانتظر تأكيد الرصيد قبل المغادرة.",
                )}
              </Txt>
              <Txt size={13} muted>
                {t(
                  "Agent integration is not connected. No deposit reference can be issued yet.",
                  "تكامل الوكلاء غير متصل. لا يمكن إصدار مرجع إيداع حالياً.",
                )}
              </Txt>
              <Button
                secondary
                label={t("View sample locations", "عرض المواقع التجريبية")}
                onPress={() => go("cash")}
              />
            </Panel>
          )}
          {step === 2 &&
            notice(
              "Card funding will use the issuer’s hosted checkout and 3DS. This demo does not collect card numbers or create a charge.",
              "سيتم تمويل البطاقة عبر صفحة دفع معتمدة و3DS. لا يجمع هذا العرض أرقام البطاقات ولا يخصم أموالاً.",
            )}
          {step === 3 &&
            notice(
              "Your receiving account details will appear after the banking partner is connected. No sample IBAN is presented as usable.",
              "ستظهر بيانات حساب الاستلام بعد ربط الشريك المصرفي. لا يُعرض رقم IBAN تجريبي على أنه صالح.",
            )}
        </>
      );
      break;
    case "review": {
      const d = s.draft;
      content = d ? (
        <>
          <Tag label={t("Demonstration quote", "سعر تجريبي")} />
          <Txt size={42} weight="500">
            {money(d.amount)}
          </Txt>
          <Txt muted>{t("To ", "إلى ") + t(d.label, d.labelAr)}</Txt>
          <Panel>
            {[
              [t("From", "من"), t("USD wallet", "محفظة USD")],
              [t("Amount", "المبلغ"), money(d.amount)],
              [t("Example fee", "الرسوم التوضيحية"), money(d.fee)],
              [t("Total debit", "إجمالي الخصم"), money(d.amount + d.fee)],
              [
                t("Available afterwards", "المتاح بعد العملية"),
                money(available(ledger) - d.amount - d.fee),
              ],
            ].map(([a, b]) => (
              <Row key={a} style={{ justifyContent: "space-between" }}>
                <Txt muted size={14}>
                  {a}
                </Txt>
                <Txt weight="600">{b}</Txt>
              </Row>
            ))}
          </Panel>
          <Txt size={12} muted>
            {t("Quote expires in ", "ينتهي السعر خلال ") +
              Math.max(0, Math.ceil((d.expires - time) / 1000)) +
              t(" seconds", " ثانية")}
          </Txt>
          {d.type === "reserve" &&
            notice(
              "In the live service, an agent must accept before your balance is held. The button below simulates that acceptance.",
              "في الخدمة الفعلية، يجب قبول الوكيل قبل حجز رصيدك. الزر أدناه يحاكي هذا القبول.",
            )}
          {err}
          <Button
            testID="confirm-payment"
            disabled={time > d.expires}
            label={
              d.type === "reserve"
                ? t("Simulate agent acceptance", "محاكاة قبول الوكيل")
                : t("Confirm demo payment", "تأكيد العملية التجريبية")
            }
            onPress={confirm}
          />
          <Button
            secondary
            label={t("Back to edit", "العودة للتعديل")}
            onPress={() => router.back()}
          />
        </>
      ) : (
        notice(
          "No quote selected. Start a payment from Home.",
          "لم يُحدد سعر. ابدأ عملية من الرئيسية.",
        )
      );
      break;
    }
    case "receipt": {
      const tx = s.receipt;
      const current = ledger.transactions.find((x) => x.id === tx?.id) || tx;
      content = current ? (
        <>
          <View style={{ alignItems: "center", paddingVertical: 18, gap: 14 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: theme.soft,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon
                name={
                  current.status === "cancelled"
                    ? "close"
                    : current.status === "reserved"
                      ? "clock"
                      : "check"
                }
                size={32}
                color={theme.accent}
              />
            </View>
            <Txt size={24} weight="600">
              {current.status === "reserved"
                ? t("Cash reserved · demo", "تم حجز النقد · تجريبي")
                : current.status === "cancelled"
                  ? t("Reservation cancelled", "تم إلغاء الحجز")
                  : t("Demo completed", "اكتملت التجربة")}
            </Txt>
            <Txt size={38}>{money(Math.abs(current.amount))}</Txt>
          </View>
          <Panel>
            <Txt weight="600">{current.label}</Txt>
            <Txt muted size={13}>
              {current.date}
            </Txt>
            <Txt size={12} style={{ writingDirection: "ltr" }}>
              {current.id}
            </Txt>
            <Txt muted size={12}>
              {t(
                "Sample receipt. No real money moved.",
                "إيصال تجريبي. لم تتحرك أموال حقيقية.",
              )}
            </Txt>
          </Panel>
          {current.status === "reserved" && (
            <>
              <Txt>
                {t(
                  "The amount is held, not spent. This demo reservation can be cancelled below.",
                  "المبلغ محجوز وليس منفَقاً. يمكنك إلغاء الحجز التجريبي أدناه.",
                )}
              </Txt>
              <Button
                secondary
                label={t(
                  "Cancel reservation & release hold",
                  "ألغِ الحجز وحرّر المبلغ",
                )}
                onPress={() => {
                  const next = cancelReservation(ledger, current.id);
                  s.setLedger(next);
                  s.setReceipt(
                    next.transactions.find((x) => x.id === current.id) || null,
                  );
                }}
              />
            </>
          )}
          <Button
            label={t("Back to Home", "العودة للرئيسية")}
            onPress={() => router.replace("/")}
          />
          <Button
            secondary
            label={t(
              "Get help with this transaction",
              "مساعدة بشأن هذه العملية",
            )}
            onPress={() => go("support")}
          />
        </>
      ) : (
        notice(
          "Choose a transaction from Activity to see its details.",
          "اختر عملية من النشاط لعرض تفاصيلها.",
        )
      );
      break;
    }
    case "activity":
      content = (
        <>
          <Field
            label={t("Search activity", "ابحث في العمليات")}
            value={search}
            onChange={setSearch}
          />
          <Row>
            {[
              ["all", "All", "الكل"],
              ["cash", "Cash", "نقد"],
              ["card", "Cards", "بطاقات"],
            ].map(([v, en, ar]) => (
              <Pressable
                accessibilityRole="button"
                key={v}
                onPress={() => setFilter(v)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: filter === v ? theme.button : theme.elevated,
                }}
              >
                <Txt
                  size={13}
                  style={{ color: filter === v ? "white" : theme.text }}
                >
                  {t(en, ar)}
                </Txt>
              </Pressable>
            ))}
          </Row>
          {ledger.transactions
            .filter(
              (x) =>
                (filter === "all" || x.kind === filter) &&
                x.label.toLowerCase().includes(search.toLowerCase()),
            )
            .map(transaction)}
          {!ledger.transactions.some(
            (x) =>
              (filter === "all" || x.kind === filter) &&
              x.label.toLowerCase().includes(search.toLowerCase()),
          ) &&
            notice(
              "No transactions match. Try another search or filter.",
              "لا توجد عمليات مطابقة. جرّب بحثاً أو تصنيفاً آخر.",
            )}
        </>
      );
      break;
    case "services":
      content = (
        <>
          <Txt muted>
            {t(
              "The useful things, all in one place.",
              "الأشياء المفيدة، في مكان واحد.",
            )}
          </Txt>
          <Panel style={{ backgroundColor: theme.soft }}>
            <Tag label={t("TRAVEL", "السفر")} />
            <Txt size={28} weight="500">
              {t("Land. Connect. Go.", "وصلت. اتصل. انطلق.")}
            </Txt>
            <Txt muted>
              {t(
                "Explore sample eSIM plans before your next trip.",
                "استعرض باقات eSIM التجريبية قبل سفرك.",
              )}
            </Txt>
            <Button
              label={t("Explore eSIMs", "استكشف eSIM")}
              onPress={() => go("esim")}
            />
          </Panel>
          <Cell
            icon="phone"
            title={t("Mobile top-ups", "شحن الهاتف")}
            sub="Alfa · Touch"
            onPress={() => go("topup")}
          />
          <Cell
            icon="receipt"
            title={t("Bills & subscriptions", "الفواتير والاشتراكات")}
            sub={t(
              "Internet, utilities and digital services",
              "الإنترنت والمرافق والخدمات الرقمية",
            )}
            onPress={() => go("bills")}
          />
          <Cell
            icon="pocket"
            title={t("Pockets", "مساحات")}
            onPress={() => go("pockets")}
          />
          <Cell
            icon="business"
            title={t("For your business", "لأعمالك")}
            onPress={() => go("business")}
          />
          <Cell
            icon="globe"
            title="USDT"
            sub={t("Service availability", "توفر الخدمة")}
            onPress={() => go("usdt")}
          />
        </>
      );
      break;
    case "topup":
      content = (
        <>
          <Row>
            {["Alfa", "Touch"].map((v) => (
              <Pressable
                key={v}
                onPress={() => setService(v)}
                accessibilityRole="radio"
                accessibilityState={{ checked: service === v }}
                style={{
                  flex: 1,
                  padding: 20,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: service === v ? theme.accent : theme.line,
                }}
              >
                <Txt weight="600">{v}</Txt>
              </Pressable>
            ))}
          </Row>
          <Field
            label={t("Lebanese mobile number", "رقم الهاتف اللبناني")}
            value={phone}
            onChange={setPhone}
            placeholder="03 123 456"
          />
          <Field
            label={t("Top-up amount in USD", "مبلغ الشحن بالدولار")}
            numeric
            value={amount}
            onChange={setAmount}
          />
          {notice(
            "Sample top-up only. No airtime or voucher will be delivered.",
            "شحن تجريبي فقط. لن تُرسل وحدات أو قسيمة.",
          )}
          {err}
          <Button
            label={t("Review top-up", "راجع الشحن")}
            onPress={() => {
              if (
                !/^(03|70|71|76|78|79|81)\d{6}$/.test(phone.replace(/\s/g, ""))
              ) {
                setError(
                  t(
                    "Enter a valid 8-digit Lebanese mobile number.",
                    "أدخل رقم هاتف لبناني صحيحاً من 8 أرقام.",
                  ),
                );
                return;
              }
              makeDraft(
                "service",
                `${service} ${phone}`,
                `${service} ${phone}`,
              );
            }}
          />
        </>
      );
      break;
    case "esim":
      content = (
        <>
          {err}
          <Txt muted>
            {t(
              "Choose a destination. Check your device before buying.",
              "اختر الوجهة وتحقّق من جهازك قبل الشراء.",
            )}
          </Txt>
          {[
            ["Turkey", "تركيا", "5 GB", "30 days", 1200],
            ["Europe", "أوروبا", "10 GB", "30 days", 2500],
            ["United Arab Emirates", "الإمارات", "3 GB", "7 days", 1500],
          ].map(([en, ar, data, days, price]) => (
            <Panel key={String(en)}>
              <Row style={{ justifyContent: "space-between" }}>
                <Txt weight="600">{t(String(en), String(ar))}</Txt>
                <Icon name="globe" color={theme.accent} />
              </Row>
              <Txt size={27}>{String(data)}</Txt>
              <Txt muted size={13}>
                {t(String(days), days === "7 days" ? "7 أيام" : "30 يوماً")} ·{" "}
                {t("Data only", "بيانات فقط")}
              </Txt>
              <Txt size={13}>
                {t(
                  "Your phone must support eSIM and be carrier-unlocked. Activation and coverage depend on the selected provider.",
                  "يجب أن يدعم هاتفك eSIM وأن يكون غير مقفل على مشغّل. التفعيل والتغطية يعتمدان على المزوّد.",
                )}
              </Txt>
              <Button
                secondary
                label={
                  t("Preview sample plan · ", "معاينة الباقة التجريبية · ") +
                  money(Number(price))
                }
                onPress={() =>
                  makeDraft(
                    "service",
                    `${en} eSIM · no activation`,
                    `${ar} eSIM · بدون تفعيل`,
                    Number(price),
                  )
                }
              />
            </Panel>
          ))}
          {notice(
            "Illustrative plans and prices. No eSIM is provisioned in this demo.",
            "باقات وأسعار توضيحية. لا تُفعّل eSIM في هذا العرض.",
          )}
        </>
      );
      break;
    case "bills":
      content = (
        <>
          <Txt muted>
            {t(
              "Keep one-off vouchers separate from recurring card subscriptions.",
              "ميّز بين القسائم لمرة واحدة والاشتراكات المتكررة بالبطاقة.",
            )}
          </Txt>
          {[
            ["Ogero", "أوجيرو", "Internet bill", "فاتورة الإنترنت"],
            ["Utilities", "المرافق", "Approved billers", "الجهات المعتمدة"],
            [
              "Gift cards",
              "بطاقات هدايا",
              "One-off digital vouchers",
              "قسائم رقمية لمرة واحدة",
            ],
            [
              "Subscriptions",
              "الاشتراكات",
              "Manage card renewals",
              "إدارة تجديدات البطاقة",
            ],
          ].map(([en, ar, sub, subar]) => (
            <Cell
              key={en}
              icon="receipt"
              title={t(en, ar)}
              sub={t(sub, subar)}
              onPress={() => {
                setService(en);
                setStep(1);
              }}
            />
          ))}
          {step === 1 &&
            notice(
              `${service}: this service needs a contracted biller or issuer integration. No charge or subscription has been created.`,
              `${service}: تحتاج الخدمة إلى تكامل مع الجهة المعنية. لم تُنشأ عملية دفع أو اشتراك.`,
            )}
        </>
      );
      break;
    case "usdt":
      content = (
        <>
          <Tag label={t("Not activated", "غير مفعّلة")} />
          <Txt size={28} weight="500">
            {t(
              "A separate asset. A clear journey.",
              "أصل منفصل. وخطوات واضحة.",
            )}
          </Txt>
          <Txt muted>
            {t(
              "USDT access is not available in this demo. Eligibility, supported networks and partners must be confirmed before launch.",
              "خدمة USDT غير متوفرة في هذا العرض. يجب تأكيد الأهلية والشبكات والشركاء قبل الإطلاق.",
            )}
          </Txt>
          <Cell
            icon="arrow"
            title={t("1. Receive USDT", "1. استلام USDT")}
            sub={t(
              "Exact token, network and confirmations",
              "الرمز والشبكة والتأكيدات المحددة",
            )}
          />
          <Cell
            icon="swap"
            title={t("2. Review conversion", "2. مراجعة التحويل")}
            sub={t(
              "Live quote, all fees, USD received",
              "سعر مباشر وكل الرسوم والدولارات المستلمة",
            )}
          />
          <Cell
            icon="card"
            title={t(
              "3. Fund a card or book cash",
              "3. تمويل البطاقة أو حجز النقد",
            )}
            sub={t(
              "Explicit USD funding after conversion",
              "تمويل واضح بالدولار بعد التحويل",
            )}
          />
          {notice(
            "No deposit address is generated. Never send funds to an address from a design preview.",
            "لا يُنشأ عنوان إيداع. لا ترسل أموالاً إلى عنوان في معاينة تصميم.",
          )}
        </>
      );
      break;
    case "international":
      content = (
        <>
          <Tag label={t("Partner integration required", "يتطلب ربط الشريك")} />
          <Txt size={28}>
            {t("Know what arrives.", "اعرف المبلغ الذي يصل.")}
          </Txt>
          <Txt muted>
            {t(
              "The transfer quote will show what you pay, the exchange rate, every known fee, the recipient’s net amount and delivery time.",
              "سيعرض السعر ما تدفعه وسعر الصرف وكل الرسوم المعروفة وصافي مبلغ المستلم ووقت الوصول.",
            )}
          </Txt>
          {notice(
            "No corridor is enabled yet. This preview cannot send an international transfer.",
            "لا يوجد مسار مفعّل بعد. لا يمكن إرسال تحويل دولي من هذه المعاينة.",
          )}
          <Button
            secondary
            label={t("Send a sample local transfer", "جرّب تحويلاً محلياً")}
            onPress={() => go("send")}
          />
        </>
      );
      break;
    case "business":
      content = (
        <>
          <Tag label={t("BUSINESS PREVIEW", "معاينة الأعمال")} />
          <Txt size={28} weight="500">
            {t(
              "Get paid. Choose what happens next.",
              "استلم أموالك. واختر خطوتك التالية.",
            )}
          </Txt>
          <Cell
            icon="receipt"
            title={t("Payment links & invoices", "روابط الدفع والفواتير")}
            sub={t(
              "Track paid, unpaid and refunded",
              "تتبّع المدفوع وغير المدفوع والمسترد",
            )}
            onPress={() => setStep(1)}
          />
          <Cell
            icon="cash"
            title={t("Cash settlement", "التسوية النقدية")}
            sub={t(
              "Net amount and confirmed collection window",
              "صافي المبلغ وموعد استلام مؤكد",
            )}
            onPress={() => go("reserve")}
          />
          <Cell
            icon="user"
            title={t("Payroll & staff roles", "الرواتب وصلاحيات الموظفين")}
            sub={t("Prepare, approve, reconcile", "تحضير، موافقة، مطابقة")}
            onPress={() => setStep(2)}
          />
          {step > 0 &&
            notice(
              "Business onboarding, approvals and settlement require a business backend. This is a product preview, not an operating merchant account.",
              "يتطلب فتح حساب الأعمال والموافقات والتسوية نظاماً خلفياً. هذه معاينة للمنتج وليست حساب تاجر فعلياً.",
            )}
        </>
      );
      break;
    case "profile":
      content = (
        <>
          <Row>
            <View
              style={{
                width: 62,
                height: 62,
                borderRadius: 31,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.soft,
              }}
            >
              <Txt size={20} weight="600">
                RE
              </Txt>
            </View>
            <View>
              <Txt size={22} weight="600">
                {t("Rayan Elannan", "ريان العنان")}
              </Txt>
              <Txt muted size={12}>
                {t(
                  "Demo profile · no identity verified",
                  "حساب تجريبي · لم يتم التحقق من الهوية",
                )}
              </Txt>
            </View>
          </Row>
          <Row style={{ justifyContent: "space-between", paddingVertical: 12 }}>
            <Txt>{t("Dark appearance", "المظهر الداكن")}</Txt>
            <Switch
              accessibilityLabel={t("Dark appearance", "المظهر الداكن")}
              value={s.dark}
              onValueChange={s.setDark}
              trackColor={{ true: theme.button }}
            />
          </Row>
          <Button
            secondary
            label={t("العربية", "English")}
            onPress={() => s.setLang(rtl ? "en" : "ar")}
          />
          <Cell
            icon="lock"
            title={t("Security & recovery", "الأمان والاسترداد")}
            onPress={() => go("security")}
          />
          <Cell
            icon="user"
            title={t("Preview onboarding", "معاينة فتح الحساب")}
            onPress={() => go("onboarding")}
          />
          <Cell
            icon="help"
            title={t("Help & cases", "المساعدة والطلبات")}
            onPress={() => go("support")}
          />
          {section("Demo controls", "إعدادات العرض")}
          <Txt size={12} muted>
            {t(
              "These controls are for design review only.",
              "هذه الإعدادات لمراجعة التصميم فقط.",
            )}
          </Txt>
          <Row style={{ flexWrap: "wrap" }}>
            {(["normal", "offline", "declined", "pending"] as const).map(
              (v, i) => (
                <Pressable
                  key={v}
                  onPress={() => s.setScenario(v)}
                  accessibilityRole="button"
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    backgroundColor:
                      s.scenario === v ? theme.button : theme.elevated,
                  }}
                >
                  <Txt
                    size={12}
                    style={{ color: s.scenario === v ? "white" : theme.text }}
                  >
                    {t(v, ["عادي", "غير متصل", "مرفوض", "قيد الانتظار"][i])}
                  </Txt>
                </Pressable>
              ),
            )}
          </Row>
          <Button
            secondary
            label={t("Reset sample balances", "إعادة ضبط الأرصدة التجريبية")}
            onPress={() => {
              s.setLedger({ ...initialLedger });
              s.setDraft(null);
              s.setReceipt(null);
              s.setScenario("normal");
              setRequest(t("Demo balances reset.", "تمت إعادة ضبط الأرصدة."));
            }}
          />
          {request && <Txt>{request}</Txt>}
        </>
      );
      break;
    case "security":
      content = (
        <>
          <Cell
            icon="lock"
            title={t("App lock", "قفل التطبيق")}
            sub={t(
              "Biometric unlock and fallback PIN: native integration pending",
              "فتح بالبصمة ورمز بديل: التكامل قيد التنفيذ",
            )}
          />
          <Cell
            icon="phone"
            title={t(
              "Lost phone or changed number?",
              "فقدت هاتفك أو غيّرت رقمك؟",
            )}
            sub={t(
              "Recover identity and revoke old sessions",
              "استرداد الهوية وإلغاء الجلسات القديمة",
            )}
            onPress={() => go("support")}
          />
          <Cell
            icon="user"
            title={t("Trusted devices", "الأجهزة الموثوقة")}
            sub={t(
              "No real sessions exist in this demo",
              "لا توجد جلسات فعلية في العرض",
            )}
          />
          {notice(
            "We will never ask you to share a PIN or one-time code in a support chat.",
            "لن نطلب منك مشاركة رمز PIN أو رمز التحقق في محادثة الدعم.",
          )}
        </>
      );
      break;
    case "onboarding":
      content = (
        <>
          <Mark size={58} />
          <Txt size={32} weight="600">
            {t(
              [
                "Money, on your terms.",
                "Your number. Your account.",
                "Verify once. Move forward.",
                "You’re ready to explore.",
              ][step],
              [
                "أموالك، على طريقتك.",
                "رقمك. حسابك.",
                "تحقّق من هويتك وتابع.",
                "أنت جاهز للاستكشاف.",
              ][step],
            )}
          </Txt>
          <Txt muted>
            {t(
              [
                "Receive money, use cash or spend by card. Start with what you need.",
                "Phone verification will use a secure one-time code. No SMS is sent in this demo.",
                "Identity document and selfie capture will be handled by the connected verification provider. Do not upload documents here.",
                "This is a sample account. Real verification and funding are not enabled.",
              ][step],
              [
                "استلم المال أو استخدم النقد أو البطاقة. ابدأ بما تحتاجه.",
                "التحقق من الهاتف سيتم برمز آمن. لا تُرسل رسالة في هذا العرض.",
                "سيتم التقاط الهوية والصورة عبر مزوّد التحقق. لا ترفع مستندات هنا.",
                "هذا حساب تجريبي. التحقق الفعلي والتمويل غير مفعّلين.",
              ][step],
            )}
          </Txt>
          <Row>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: i <= step ? theme.button : theme.line,
                }}
              />
            ))}
          </Row>
          <Button
            label={
              step === 3
                ? t("Explore PAYLAK", "استكشف بايلاك")
                : t("Continue preview", "تابع المعاينة")
            }
            onPress={() =>
              step === 3 ? router.replace("/") : setStep(step + 1)
            }
          />
        </>
      );
      break;
    case "support":
      content = (
        <>
          <Txt size={28} weight="500">
            {t("A person when it matters.", "شخص يسمعك وقت الحاجة.")}
          </Txt>
          <Txt muted>
            {t(
              "Describe the issue. We’ll keep the payment reference attached.",
              "اشرح المشكلة وسنُرفق مرجع العملية.",
            )}
          </Txt>
          {s.receipt && <Tag label={s.receipt.id} />}
          <Field
            label={t("How can we help?", "كيف نساعدك؟")}
            value={note}
            onChange={setNote}
          />
          {err}
          <Button
            label={t("Create sample support case", "أنشئ طلب دعم تجريبياً")}
            onPress={() => {
              if (note.trim().length < 10) {
                setError(
                  t(
                    "Please add at least 10 characters.",
                    "أضف 10 أحرف على الأقل.",
                  ),
                );
                return;
              }
              const id = `CASE-DEMO-${++sequence}`;
              s.setTickets([...s.tickets, id]);
              setRequest(id);
              setError("");
            }}
          />
          {request &&
            notice(
              `${request}: saved in this session only. It has not been sent to a support team.`,
              `${request}: محفوظ في هذه الجلسة فقط ولم يُرسل لفريق الدعم.`,
            )}
          {s.tickets.map((id) => (
            <Cell
              key={id}
              icon="help"
              title={id}
              sub={t("Sample case · not submitted", "طلب تجريبي · لم يُرسل")}
            />
          ))}
          <Cell
            icon="lock"
            title={t(
              "Lost phone or suspected fraud",
              "فقدان الهاتف أو الاشتباه باحتيال",
            )}
            onPress={() =>
              setNote(
                t(
                  "I need help securing my account.",
                  "أحتاج المساعدة في تأمين حسابي.",
                ),
              )
            }
          />
        </>
      );
      break;
    case "notifications":
      content = (
        <>
          <Cell
            icon="check"
            title={t(
              "Welcome to your PAYLAK preview",
              "أهلاً بك في معاينة بايلاك",
            )}
            sub={t(
              "Sample data. No real transactions.",
              "بيانات تجريبية، بدون عمليات فعلية.",
            )}
          />
          <Cell
            icon="card"
            title={t("Your card, under your control", "بطاقتك تحت سيطرتك")}
            sub={t(
              "Try freezing it or changing a spending limit.",
              "جرّب تجميد البطاقة أو تغيير حد الإنفاق.",
            )}
            onPress={() => go("cards")}
          />
        </>
      );
      break;
    case "pending":
      content = (
        <>
          <Icon name="clock" size={48} color={theme.accent} />
          <Txt size={26}>
            {t("Waiting for confirmation", "بانتظار التأكيد")}
          </Txt>
          <Txt muted>
            {t(
              "Do not send it again. Check this same reference for the outcome. In this scenario no demo balance has been debited.",
              "لا ترسل مجدداً. تابع نفس المرجع لمعرفة النتيجة. لم يُخصم الرصيد في هذا السيناريو.",
            )}
          </Txt>
          <Tag label={s.draft?.key || "DEMO"} />
          <Button
            label={t("Simulate confirmed outcome", "محاكاة نتيجة مؤكدة")}
            onPress={() => {
              s.setScenario("normal");
              go("review");
            }}
          />
          <Button
            secondary
            label={t("Get help", "اطلب المساعدة")}
            onPress={() => go("support")}
          />
        </>
      );
      break;
    case "failed":
      content = (
        <>
          <Icon name="close" size={48} color={theme.danger} />
          <Txt size={26}>{t("Nothing was debited", "لم يُخصم أي مبلغ")}</Txt>
          <Txt muted>
            {t(
              "This is a simulated declined payment. Review the details before trying again.",
              "هذه محاكاة لعملية مرفوضة. راجع التفاصيل قبل المحاولة مجدداً.",
            )}
          </Txt>
          <Button
            label={t("Review details", "راجع التفاصيل")}
            onPress={() => {
              s.setScenario("normal");
              go("review");
            }}
          />
        </>
      );
      break;
    default:
      content = (
        <>
          <Txt>
            {t("This page is not available.", "هذه الصفحة غير متوفرة.")}
          </Txt>
          <Button
            label={t("Back to Home", "العودة للرئيسية")}
            onPress={() => router.replace("/")}
          />
        </>
      );
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          width > 700 ? (s.dark ? "#060D18" : "#DDE5F2") : theme.bg,
      }}
    >
      <StatusBar style={s.dark ? "light" : "dark"} />
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 480,
          alignSelf: "center",
          backgroundColor: theme.bg,
          borderLeftWidth: width > 700 ? 1 : 0,
          borderRightWidth: width > 700 ? 1 : 0,
          borderColor: theme.line,
        }}
      >
        <View
          style={{
            backgroundColor: theme.soft,
            paddingVertical: 6,
            paddingHorizontal: 24,
          }}
        >
          <Row style={{ justifyContent: "space-between" }}>
            <Txt size={10} weight="600" style={{ color: theme.accent }}>
              {t(
                "INTERACTIVE DEMO · NO REAL MONEY",
                "عرض تفاعلي · بدون أموال حقيقية",
              )}
            </Txt>
            <Pressable
              onPress={() => s.setLang(rtl ? "en" : "ar")}
              accessibilityRole="button"
              accessibilityLabel={t("Switch to Arabic", "Switch to English")}
              style={{ minHeight: 30, minWidth: 44, justifyContent: "center" }}
            >
              <Txt size={11}>{t("عربي", "EN")}</Txt>
            </Pressable>
          </Row>
        </View>
        <Row
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            justifyContent: "space-between",
          }}
        >
          {main ? (
            <Row>
              <Mark size={24} />
              <Txt size={16} weight="700" style={{ letterSpacing: 3 }}>
                PAYLAK
              </Txt>
            </Row>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("Back", "رجوع")}
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace("/")
              }
              style={{ padding: 10, transform: [{ scaleX: rtl ? -1 : 1 }] }}
            >
              <Icon name="back" />
            </Pressable>
          )}
          <Row>
            <Pressable
              onPress={() => go("support")}
              accessibilityRole="button"
              accessibilityLabel={t("Help", "مساعدة")}
              style={{ padding: 10 }}
            >
              <Icon name="help" size={20} />
            </Pressable>
            <Pressable
              onPress={() => go("profile")}
              accessibilityRole="button"
              accessibilityLabel={t("Profile", "الحساب")}
              style={{ padding: 10 }}
            >
              <Icon name="user" size={20} />
            </Pressable>
          </Row>
        </Row>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            key={name}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 10,
              paddingBottom: 32,
              gap: 18,
            }}
          >
            {name !== "home" && (
              <Txt
                size={30}
                weight="600"
                style={{ letterSpacing: rtl ? 0 : -0.7 }}
              >
                {t(...header)}
              </Txt>
            )}
            {content}
          </ScrollView>
        </KeyboardAvoidingView>
        {main && (
          <Row
            style={{
              paddingHorizontal: 10,
              paddingTop: 10,
              paddingBottom: 8,
              borderTopWidth: 1,
              borderTopColor: theme.line,
              backgroundColor: theme.surface,
              gap: 0,
            }}
          >
            {tabs.map(([id, icon, en, ar]) => (
              <Pressable
                key={id}
                accessibilityRole="tab"
                accessibilityState={{ selected: name === id }}
                accessibilityLabel={t(en, ar)}
                onPress={() =>
                  router.replace(id === "home" ? "/" : `/screen/${id}`)
                }
                style={{
                  flex: 1,
                  minHeight: 55,
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 4,
                }}
              >
                <Icon
                  name={icon}
                  size={21}
                  color={name === id ? theme.accent : theme.muted}
                />
                <Txt
                  size={10}
                  weight={name === id ? "600" : "400"}
                  style={{ color: name === id ? theme.accent : theme.muted }}
                >
                  {t(en, ar)}
                </Txt>
              </Pressable>
            ))}
          </Row>
        )}
      </View>
    </SafeAreaView>
  );
}
