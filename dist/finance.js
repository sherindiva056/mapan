export const categories = [
  "Makan & minum",
  "Transportasi",
  "Belanja",
  "Kos & tagihan",
  "Kuliah",
  "Hiburan",
  "Lainnya",
];
export const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export function summarize(rows) {
  return rows.reduce(
    (a, t) => {
      a[t.type] += Number(t.amount);
      a.balance += (t.type === "income" ? 1 : -1) * Number(t.amount);
      return a;
    },
    { income: 0, expense: 0, balance: 0 },
  );
}
export function validTransaction(t) {
  return (
    ["income", "expense"].includes(t.type) &&
    Number.isSafeInteger(t.amount) &&
    t.amount > 0 &&
    t.amount <= 1000000000 &&
    typeof t.description === "string" &&
    t.description.trim().length > 0 &&
    t.description.length <= 100 &&
    categories.includes(t.category) &&
    /^\d{4}-\d{2}-\d{2}$/.test(t.date) &&
    !Number.isNaN(Date.parse(t.date)) &&
    new Date(t.date).toISOString().slice(0, 10) === t.date
  );
}
export function parseReceipt(text) {
  const lines = text.split("\n");
  const amountLine = lines.find(
    (l) =>
      /(?:grand\s*total|total\s*(?:bayar|belanja)?|jumlah)/i.test(l) &&
      !/sub\s*total/i.test(l),
  );
  const values = (amountLine || "").match(/\d[\d.,]*\d|\d/g) || [];
  const raw = values.at(-1) || "";
  const amount = Number(raw.replace(/[.,]00$/, "").replace(/[.,]/g, ""));
  const match = text.match(/\b(\d{2})[/-](\d{2})[/-](\d{4})\b/);
  const date = match ? `${match[3]}-${match[2]}-${match[1]}` : today();
  return {
    amount: Number.isSafeInteger(amount) && amount > 0 ? amount : "",
    date,
    description:
      lines
        .find((l) => l.trim().length > 3)
        ?.trim()
        .slice(0, 100) || "",
  };
}
export function csv(rows) {
  const escape = (value) =>
    '"' +
    String(value)
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  return (
    "\ufeff" +
    [
      ["Tanggal", "Keterangan", "Jenis", "Kategori", "Nominal"],
      ...rows.map((t) => [
        t.date,
        t.description,
        t.type === "income" ? "Pemasukan" : "Pengeluaran",
        t.category,
        t.amount,
      ]),
    ]
      .map((r) => r.map(escape).join(","))
      .join("\r\n")
  );
}
