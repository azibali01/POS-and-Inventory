export type InvoiceItem = {
  sr?: number;
  section?: string;
  color?: string;
  thickness?: string | number;
  sizeFt?: string | number;
  lengths?: number;
  totalFeet?: number;
  rate?: number;
  amount?: number;
  description?: string;
};

export type InvoiceData = {
  title?: string;
  companyName?: string;
  addressLines?: string[];
  invoiceNo?: string;
  date?: string;
  gpNo?: string;
  ms?: string;
  customer?: string;
  grn?: string | null;
  items: InvoiceItem[];
  totals?: { subtotal?: number; total?: number };
  footerNotes?: string[];
};

function escapeHtml(s: unknown) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderInvoiceHTML(data: InvoiceData) {
  const css = `
    body{font-family: Inter, Arial, Helvetica, sans-serif; color:#111;}
    .sheet{width:210mm; margin:8mm auto; padding:8mm;}
    .header{display:flex; justify-content:space-between; align-items:flex-start}
    .brand{font-weight:800; font-size:18px}
    .meta{font-size:12px}
    table.grid{width:100%; border-collapse:collapse; margin-top:8px}
    table.grid th{background:#f7f7f7; border:1px solid #cfcfcf; padding:6px; font-size:12px}
    table.grid td{border:1px solid #cfcfcf; padding:6px; font-size:12px}
    .small{font-size:11px; color:#555}
    .right{text-align:right}
    .totals{margin-top:8px; width:100%; display:flex; justify-content:flex-end}
    .totals .box{width:320px}
    .signature{margin-top:24px; display:flex; justify-content:space-between}
    @media print{ body{margin:0} .sheet{margin:0; padding:6mm} }
  `;

  const headerLeft = `
    <div>
      <div class="brand">${escapeHtml(data.companyName ?? "")}</div>
      ${(data.addressLines || [])
      .map((l) => `<div class="small">${escapeHtml(l)}</div>`)
      .join("")}
    </div>
  `;

  const headerRight = `
    <div class="meta small">
      <div>Sr. No: ${escapeHtml(data.invoiceNo ?? "")}</div>
      <div>G.P No: ${escapeHtml(data.gpNo ?? "")}</div>
      <div>Date: ${escapeHtml(data.date ?? "")}</div>
      <div>M/S: ${escapeHtml(data.ms ?? "")}</div>
      <div>GRN: ${escapeHtml(data.grn ?? "-")}</div>
    </div>
  `;

  const cols = [
    "Sr.#",
    "Section",
    "Color",
    "Thick",
    "Size ft",
    "No.of Lengths",
    "Total Feet",
    "Rate",
    "Amount",
  ];

  const rowsHtml =
    data.items && data.items.length
      ? data.items
        .map(
          (it, idx) => `
      <tr>
        <td>${escapeHtml(it.sr ?? idx + 1)}</td>
        <td>${escapeHtml(it.section ?? it.description ?? "")}</td>
        <td>${escapeHtml(it.color ?? "")}</td>
        <td>${escapeHtml(it.thickness ?? "")}</td>
        <td>${escapeHtml(it.sizeFt ?? "")}</td>
        <td class="right">${escapeHtml(it.lengths ?? "")}</td>
        <td class="right">${escapeHtml(it.totalFeet ?? "")}</td>
        <td class="right">${it.rate != null ? Number(it.rate).toFixed(2) : ""
            }</td>
        <td class="right">${it.amount != null ? Number(it.amount).toFixed(2) : ""
            }</td>
      </tr>
    `
        )
        .join("")
      : Array.from({ length: 12 })
        .map(() => `<tr>${cols.map(() => `<td>&nbsp;</td>`).join("")}</tr>`)
        .join("");

  const totalsHtml = `
    <div class="totals">
      <div class="box">
        <div style="display:flex;justify-content:space-between"><div class="small">Subtotal</div><div>${data.totals?.subtotal ? Number(data.totals.subtotal).toFixed(2) : ""
    }</div></div>
        <div style="display:flex;justify-content:space-between;font-weight:700;margin-top:6px"><div>Total</div><div>${data.totals?.total ? Number(data.totals.total).toFixed(2) : ""
    }</div></div>
      </div>
    </div>
  `;

  const footer = (data.footerNotes || [])
    .map((n) => `<div class="small">${escapeHtml(n)}</div>`)
    .join("");

  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(data.title ?? "Invoice")}</title>
    <style>${css}</style>
  </head>
  <body>
    <div class="sheet">
      <div class="header">
        ${headerLeft}
        ${headerRight}
      </div>

      <div style="margin-top:8px">
        <table class="grid">
          <thead>
            <tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      ${totalsHtml}

      <div class="signature">
        <div class="small">By ____________________</div>
        <div class="small">Signature ____________________</div>
      </div>

      <div style="margin-top:8px">${footer}</div>
    </div>
    <script>window.onload=function(){ setTimeout(()=>{ window.print(); }, 250); }</script>
  </body>
  </html>
  `;
}
