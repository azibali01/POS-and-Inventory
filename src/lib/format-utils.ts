export function formatCurrency(n: number) {
  try {
    // Use Pakistani locale and PKR currency so formatting (symbol, grouping) matches PKR
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
    }).format(n);
  } catch {
    return `Rs ${n.toFixed(2)}`;
  }
}

export function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}
