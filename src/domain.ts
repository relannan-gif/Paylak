/** Deterministic DEMO ledger. Never use this client-side implementation for real funds. */
export type Transaction = {
  id: string;
  label: string;
  amount: number;
  kind: "sent" | "card" | "service" | "received" | "cash";
  status: "completed" | "reserved" | "cancelled";
  date: string;
};
export type Ledger = {
  wallet: number;
  card: number;
  pocket: number;
  held: number;
  transactions: Transaction[];
  keys: string[];
};
export const initialLedger: Ledger = {
  wallet: 245000,
  card: 108000,
  pocket: 35000,
  held: 0,
  keys: [],
  transactions: [
    {
      id: "PL-DEMO-1003",
      label: "Sara Haddad",
      amount: 15000,
      kind: "received",
      status: "completed",
      date: "2026-09-30",
    },
    {
      id: "PL-DEMO-1002",
      label: "Market",
      amount: -2850,
      kind: "card",
      status: "completed",
      date: "2026-09-30",
    },
    {
      id: "PL-DEMO-1001",
      label: "Mobile top-up",
      amount: -1000,
      kind: "service",
      status: "completed",
      date: "2026-09-29",
    },
  ],
};
export function parseAmount(raw: string): number | null {
  const normalized = raw
    .trim()
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776))
    .replace("٫", ".");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}
export function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
export type Action = {
  type: "send" | "load" | "service" | "reserve" | "pocket";
  amount: number;
  fee: number;
  label: string;
  key: string;
  now?: number;
};
export function transact(state: Ledger, action: Action): Ledger {
  if (state.keys.includes(action.key)) return state;
  if (
    !Number.isSafeInteger(action.amount) ||
    action.amount <= 0 ||
    !Number.isSafeInteger(action.fee) ||
    action.fee < 0
  )
    throw new Error("invalidAmount");
  const total = action.amount + action.fee;
  if (total > state.wallet - state.held) throw new Error("insufficient");
  const next = {
    ...state,
    keys: [...state.keys, action.key],
    transactions: [...state.transactions],
  };
  if (action.type === "reserve") next.held += total;
  else next.wallet -= total;
  if (action.type === "load") next.card += action.amount;
  if (action.type === "pocket") next.pocket += action.amount;
  next.transactions.unshift({
    id: action.key,
    label: action.label,
    amount: -total,
    kind:
      action.type === "reserve"
        ? "cash"
        : action.type === "load"
          ? "card"
          : action.type === "service"
            ? "service"
            : "sent",
    status: action.type === "reserve" ? "reserved" : "completed",
    date: new Date(action.now ?? Date.now()).toISOString().slice(0, 10),
  });
  return next;
}
export function cancelReservation(state: Ledger, id: string): Ledger {
  const tx = state.transactions.find(
    (t) => t.id === id && t.status === "reserved",
  );
  if (!tx) return state;
  return {
    ...state,
    held: state.held - Math.abs(tx.amount),
    transactions: state.transactions.map((t) =>
      t.id === id ? { ...t, status: "cancelled" } : t,
    ),
  };
}
export function available(state: Ledger) {
  return state.wallet - state.held;
}
export const flags = {
  mode: "demo",
  livePayments: false,
  usdt: false,
  lending: false,
  internationalTransfers: false,
  identityCapture: false,
} as const;
