import test from "node:test";
import assert from "node:assert/strict";
import {
  summarize,
  validTransaction,
  parseReceipt,
  csv,
} from "../dist/finance.js";
test("balances use income and expense consistently", () =>
  assert.deepEqual(
    summarize([
      { type: "income", amount: 1000000 },
      { type: "expense", amount: 25000 },
    ]),
    { income: 1000000, expense: 25000, balance: 975000 },
  ));
test("reject invalid money, category, and calendar dates", () => {
  const t = {
    type: "expense",
    amount: 25000,
    description: "Makan",
    category: "Makan & minum",
    date: "2026-10-26",
  };
  assert.ok(validTransaction(t));
  for (const amount of [-1, 0, NaN, 1.5, 1e12])
    assert.equal(validTransaction({ ...t, amount }), false);
  assert.equal(validTransaction({ ...t, date: "2026-02-31" }), false);
  assert.equal(validTransaction({ ...t, category: "unknown" }), false);
});
test("receipt parsing chooses total rather than subtotal", () => {
  assert.equal(
    parseReceipt("TOKO MAJU\nSubtotal 24.000\nTOTAL 25.000\n26/10/2026").amount,
    25000,
  );
  assert.equal(parseReceipt("TOKO\nTOTAL Rp 25,000.00").amount, 25000);
  assert.equal(parseReceipt("TOKO\nTotal 25.000,00").amount, 25000);
  assert.equal(parseReceipt("tanpa total").amount, "");
});
test("CSV quotes input and blocks formula execution", () => {
  assert.ok(
    csv([
      {
        date: "2026-10-26",
        description: '=HYPERLINK("x")',
        type: "expense",
        category: "Lainnya",
        amount: 10,
      },
    ]).includes('"\'=HYPERLINK(""x"")"'),
  );
});
