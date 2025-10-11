export function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
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
