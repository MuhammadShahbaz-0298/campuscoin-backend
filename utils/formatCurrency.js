const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(value) {
  const amount = Number(value);
  return money.format(Number.isFinite(amount) ? amount : 0);
}

export function formatSignedCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount === 0) return formatCurrency(0);
  return `${amount > 0 ? "+" : "-"}${formatCurrency(Math.abs(amount))}`;
}

export function formatPercent(value) {
  const ratio = Number(value);
  if (!Number.isFinite(ratio)) return "0%";
  return `${Math.round(ratio)}%`;
}
