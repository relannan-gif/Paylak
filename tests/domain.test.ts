import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseAmount,
  transact,
  initialLedger,
  cancelReservation,
  available,
} from "../src/domain.ts";
test("decimal and Arabic input become exact integer cents", () => {
  assert.equal(parseAmount("12.34"), 1234);
  assert.equal(parseAmount("١٢٫٣٤"), 1234);
  assert.equal(parseAmount("۱۲.۳۴"), 1234);
});
test("invalid, zero, negative, exponent and overprecision values fail", () => {
  for (const v of [
    "",
    "0",
    "-1",
    "1e3",
    "1.001",
    "Infinity",
    "NaN",
    "2,000",
    "  .3 ",
  ])
    assert.equal(parseAmount(v), null);
});
test("send debits amount plus fee once, even with duplicate confirmation", () => {
  const a = {
    type: "send" as const,
    amount: 10000,
    fee: 50,
    label: "Sara",
    key: "same",
  };
  const once = transact(initialLedger, a);
  assert.equal(once.wallet, 234950);
  assert.equal(transact(once, a), once);
});
test("card load preserves total across distinct balances except fee", () => {
  const r = transact(initialLedger, {
    type: "load",
    amount: 10000,
    fee: 0,
    label: "Card",
    key: "load",
  });
  assert.equal(r.wallet, 235000);
  assert.equal(r.card, 118000);
  assert.equal(r.card + r.wallet, initialLedger.wallet + initialLedger.card);
});
test("reservation holds available money; cancellation is idempotent", () => {
  const r = transact(initialLedger, {
    type: "reserve",
    amount: 30000,
    fee: 150,
    label: "Hazmieh",
    key: "cash",
  });
  assert.equal(r.wallet, 245000);
  assert.equal(available(r), 214850);
  const released = cancelReservation(r, "cash");
  assert.equal(available(released), 245000);
  assert.equal(cancelReservation(released, "cash"), released);
});
test("held funds cannot be spent and rejected actions leave state unchanged", () => {
  const r = transact(initialLedger, {
    type: "reserve",
    amount: 240000,
    fee: 0,
    label: "Cash",
    key: "hold",
  });
  assert.throws(
    () =>
      transact(r, {
        type: "send",
        amount: 5001,
        fee: 0,
        label: "Sara",
        key: "fail",
      }),
    /insufficient/,
  );
  assert.equal(r.transactions.length, 4);
});
test("fractional/negative fees and amounts rejected", () => {
  for (const [amount, fee] of [
    [1.5, 0],
    [100, -1],
    [100, 0.1],
    [NaN, 0],
  ])
    assert.throws(
      () =>
        transact(initialLedger, {
          type: "send",
          amount,
          fee,
          label: "x",
          key: "x",
        }),
      /invalidAmount/,
    );
});
