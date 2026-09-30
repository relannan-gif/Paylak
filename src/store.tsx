import React, { createContext, useContext, useState } from "react";
import { initialLedger, type Ledger, type Transaction } from "./domain";
import { themes } from "./theme";
export type Draft = {
  type: "send" | "load" | "service" | "reserve" | "pocket";
  amount: number;
  fee: number;
  label: string;
  labelAr: string;
  key: string;
  expires: number;
};
function useStoreValue() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [dark, setDark] = useState(true);
  const [ledger, setLedger] = useState<Ledger>(initialLedger);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [receipt, setReceipt] = useState<Transaction | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [online, setOnline] = useState(true);
  const [cardLimit, setCardLimit] = useState(150000);
  const [scenario, setScenario] = useState<
    "normal" | "offline" | "declined" | "pending"
  >("normal");
  const [tickets, setTickets] = useState<string[]>([]);
  const [hidden, setHidden] = useState(false);
  return {
    lang,
    setLang,
    dark,
    setDark,
    ledger,
    setLedger,
    draft,
    setDraft,
    receipt,
    setReceipt,
    frozen,
    setFrozen,
    online,
    setOnline,
    cardLimit,
    setCardLimit,
    scenario,
    setScenario,
    tickets,
    setTickets,
    hidden,
    setHidden,
    theme: dark ? themes.dark : themes.light,
    rtl: lang === "ar",
    t: (en: string, ar: string) => (lang === "ar" ? ar : en),
  };
}
type Store = ReturnType<typeof useStoreValue>;
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Context.Provider value={useStoreValue()}>{children}</Context.Provider>
  );
}
export function useStore() {
  const state = useContext(Context);
  if (!state) throw Error("Missing provider");
  return state;
}
