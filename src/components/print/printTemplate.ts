export type InvoiceItem = {
  sr?: number;
  itemName?: string;
  section?: string;
  color?: string;
  thickness?: string | number;
  length?: string | number;
  sizeFt?: string | number;
  quantity?: number;
  qty?: number;
  lengths?: number;
  totalFeet?: number;
  rate?: number;
  gross?: number;
  discountPercent?: number;
  discount?: number;
  net?: number;
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
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  supplierName?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  supplierCity?: string;
  grn?: string | null;
  items: InvoiceItem[];
  totals?: {
    subtotal?: number;
    totalGrossAmount?: number;
    totalDiscount?: number;
    totalNetAmount?: number;
    total?: number;
  };
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
    * {margin:0; padding:0; box-sizing:border-box;}
    body{font-family: 'Segoe UI', Inter, Arial, Helvetica, sans-serif; color:#1a1a1a; margin:0; padding:0; background:#fff;}
    .sheet{width:210mm; height:297mm; margin:0 auto; padding:0; background:#fff; position:relative; display:flex; flex-direction:column;}
    
    /* Header & Footer Images - Full Width */
    .header-image{width:210mm; height:auto; display:block; margin:0; flex-shrink:0;}
    .footer-image{width:210mm; height:auto; display:block; margin:0; flex-shrink:0;}
    
    /* Content Area */
    .content-wrapper{padding:8mm 15mm; flex:1; display:flex; flex-direction:column;}
    
    /* Invoice Info Section */
    .header{display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; padding:8px 0; border-bottom:2px solid #1e3a8a;}
    .brand{font-weight:700; font-size:20px; color:#1e3a8a; margin-bottom:4px;}
    .meta{font-size:13px; line-height:1.6; text-align:right;}
    .meta div{margin-bottom:2px;}
    .meta strong{font-weight:600; color:#1e3a8a; min-width:60px; display:inline-block;}
    
    /* Table Styling - Proper borders */
    table.grid{width:100%; border-collapse:collapse; margin-top:12px; border:2px solid #1e3a8a;}
    table.grid th{background:#1e3a8a; color:#fff; border:1.5px solid #1e3a8a; padding:10px 8px; font-size:12px; font-weight:600; text-align:center;}
    table.grid td{border:1px solid #4b5563; padding:8px; font-size:11px; background:#fff; vertical-align:middle; height:28px;}
    table.grid tbody tr:nth-child(even){background:#f9fafb;}
    table.grid tbody tr:hover{background:#f3f4f6;}
    
    /* Utilities */
    .small{font-size:11px; color:#6b7280; line-height:1.5;}
    .right{text-align:right;}
    
    /* Totals Section */
    .totals{margin-top:16px; width:100%; display:flex; justify-content:flex-end;}
    .totals .box{width:350px; border:2px solid #1e3a8a; border-radius:4px; padding:12px; background:#f8fafc;}
    .totals .box > div{padding:6px 0;}
    .totals .box .total-row{border-top:2px solid #1e3a8a; padding-top:8px; margin-top:4px; font-size:16px;}
    
    /* Signature Section */
    .signature{margin-top:auto; padding-top:16px; display:flex; justify-content:space-between; border-top:1px dashed #9ca3af;}
    .signature > div{text-align:center; width:45%;}
    .signature .sign-line{border-bottom:1px solid #374151; margin-top:30px; margin-bottom:4px;}
    
    /* Footer Notes */
    .footer-notes{margin-top:12px; padding:8px; background:#fef3c7; border-left:4px solid #f59e0b; border-radius:2px;}
    
    @media print{ 
      body{margin:0; background:#fff;} 
      .sheet{margin:0; padding:0; box-shadow:none;} 
      @page{margin:0; size:A4 portrait;}
    }
  `;

  const headerLeft = `
    <div style="width:48%;">
      <div style="padding:8px 0;">
        <div style="font-size:13px;color:#6b7280;font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Invoice Details</div>
        ${data.title ? `
          <div style="margin-bottom:10px;">
            <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Document Type</div>
            <div style="font-weight:700;color:#1e3a8a;font-size:15px;background:#f0f4ff;padding:6px 10px;border-radius:4px;display:inline-block;">${escapeHtml(data.title)}</div>
          </div>
        ` : ""}
        <div style="margin-bottom:10px;">
          <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Invoice #</div>
          <div style="font-weight:700;color:#1e3a8a;font-size:16px;">${escapeHtml(data.invoiceNo ?? "")}</div>
        </div>
        <div style="margin-bottom:10px;">
          <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Date</div>
          <div style="font-weight:600;color:#111827;font-size:14px;">${escapeHtml(data.date ?? "")}</div>
        </div>
        ${data.gpNo ? `
          <div style="margin-bottom:10px;">
            <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">G.P No</div>
            <div style="font-weight:600;color:#111827;font-size:14px;">${escapeHtml(data.gpNo)}</div>
          </div>
        ` : ""}
        ${data.grn ? `
          <div>
            <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">GRN</div>
            <div style="font-weight:600;color:#111827;font-size:14px;">${escapeHtml(data.grn)}</div>
          </div>
        ` : ""}
      </div>
    </div>
  `;

  const headerRight = `
    <div style="width:48%;">
      ${data.customer || data.ms ? `
        <div style="padding:8px 0;">
          <div style="font-size:13px;color:#6b7280;font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Customer Details</div>
          <div style="font-weight:700;color:#1e3a8a;font-size:16px;margin-bottom:10px;">${escapeHtml(data.customer || data.ms || "")}</div>
          ${data.customerPhone ? `
            <div style="margin-bottom:10px;">
              <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Phone</div>
              <div style="font-weight:600;color:#111827;font-size:14px;">${escapeHtml(data.customerPhone)}</div>
            </div>
          ` : ""}
          ${data.customerAddress ? `
            <div style="margin-bottom:10px;">
              <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Address</div>
              <div style="font-weight:500;color:#111827;font-size:14px;">${escapeHtml(data.customerAddress)}</div>
            </div>
          ` : ""}
          ${data.customerCity ? `
            <div>
              <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">City</div>
              <div style="font-weight:600;color:#111827;font-size:14px;">${escapeHtml(data.customerCity)}</div>
            </div>
          ` : ""}
        </div>
      ` : ""}
      ${data.supplierName ? `
        <div style="padding:8px 0;">
          <div style="font-size:13px;color:#6b7280;font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Supplier Details</div>
          <div style="font-weight:700;color:#1e3a8a;font-size:16px;margin-bottom:10px;">${escapeHtml(data.supplierName)}</div>
          ${data.supplierPhone ? `
            <div style="margin-bottom:10px;">
              <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Phone</div>
              <div style="font-weight:600;color:#111827;font-size:14px;">${escapeHtml(data.supplierPhone)}</div>
            </div>
          ` : ""}
          ${data.supplierAddress ? `
            <div style="margin-bottom:10px;">
              <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Address</div>
              <div style="font-weight:500;color:#111827;font-size:14px;">${escapeHtml(data.supplierAddress)}</div>
            </div>
          ` : ""}
          ${data.supplierCity ? `
            <div>
              <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">City</div>
              <div style="font-weight:600;color:#111827;font-size:14px;">${escapeHtml(data.supplierCity)}</div>
            </div>
          ` : ""}
        </div>
      ` : ""}
    </div>
  `;

  const cols = [
    "Sr.#",
    "Item",
    "Color",
    "Thickness",
    "Length",
    "Qty",
    "Rate",
    "Gross",
    "%",
    "Discount",
    "Net",
    "Amount",
  ];

  // Ensure minimum 8 rows
  const minRows = 8;
  const itemRows = (data.items || []).map(
    (it, idx) => {
      const qty = it.quantity ?? it.qty ?? it.lengths ?? 0;
      const rate = it.rate ?? 0;
      const gross = it.gross ?? (qty * rate);
      const discountPercent = it.discountPercent ?? 0;
      const discount = it.discount ?? (gross * discountPercent / 100);
      const net = it.net ?? (gross - discount);
      const amount = it.amount ?? net;

      return `
      <tr>
        <td style="text-align:center;">${escapeHtml(it.sr ?? idx + 1)}</td>
        <td>${escapeHtml(it.itemName || it.section || it.description || "")}</td>
        <td style="text-align:center;">${escapeHtml(it.color ?? "")}</td>
        <td style="text-align:center;">${escapeHtml(it.thickness ?? "")}</td>
        <td style="text-align:center;">${escapeHtml(it.length || it.sizeFt || "")}</td>
        <td class="right">${escapeHtml(qty || "")}</td>
        <td class="right">${rate ? Number(rate).toFixed(2) : ""}</td>
        <td class="right">${gross ? Number(gross).toFixed(2) : ""}</td>
        <td style="text-align:center;">${discountPercent ? Number(discountPercent).toFixed(0) + "%" : ""}</td>
        <td class="right">${discount ? Number(discount).toFixed(2) : ""}</td>
        <td class="right">${net ? Number(net).toFixed(2) : ""}</td>
        <td class="right">${amount ? Number(amount).toFixed(2) : ""}</td>
      </tr>
      `;
    }
  ).join("");

  // Add empty rows to reach minimum
  const emptyRowsCount = Math.max(0, minRows - (data.items?.length || 0));
  const emptyRows = Array.from({ length: emptyRowsCount })
    .map(() => `<tr>${cols.map(() => `<td style="height:28px;">&nbsp;</td>`).join("")}</tr>`)
    .join("");

  const rowsHtml = itemRows + emptyRows;

  const totalsHtml = `
    <div class="totals">
      <div class="box">
        ${data.totals?.subtotal ? `<div style="display:flex;justify-content:space-between"><div>Subtotal:</div><div style="font-weight:600;">Rs. ${Number(data.totals.subtotal).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>` : ""}
        ${data.totals?.totalGrossAmount ? `<div style="display:flex;justify-content:space-between"><div>Total Gross Amount:</div><div style="font-weight:600;">Rs. ${Number(data.totals.totalGrossAmount).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>` : ""}
        ${data.totals?.totalDiscount ? `<div style="display:flex;justify-content:space-between"><div>Total Discount:</div><div style="font-weight:600;">Rs. ${Number(data.totals.totalDiscount).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>` : ""}
        ${data.totals?.totalNetAmount ? `<div style="display:flex;justify-content:space-between"><div>Total Net Amount:</div><div style="font-weight:600;">Rs. ${Number(data.totals.totalNetAmount).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>` : ""}
        <div class="total-row" style="display:flex;justify-content:space-between;font-weight:700;color:#1e3a8a;"><div>Total Amount:</div><div>Rs. ${data.totals?.total ? Number(data.totals.total).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</div></div>
      </div>
    </div>
  `;

  const footer = "";

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
      <!-- Header Image -->
      <img src="/Header.png" alt="Header" class="header-image" />
      
      <div class="content-wrapper">
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

        ${footer}

        <div class="signature">
          <div>
            <div class="sign-line"></div>
            <div class="small" style="font-weight:600; color:#374151;">Prepared By</div>
          </div>
          <div>
            <div class="sign-line"></div>
            <div class="small" style="font-weight:600; color:#374151;">Authorized Signature</div>
          </div>
        </div>
      </div>
      
      <!-- Footer Image -->
      <img src="/Footer.png" alt="Footer" class="footer-image" />
    </div>
    <script>window.onload=function(){ setTimeout(()=>{ window.print(); }, 250); }</script>
  </body>
  </html>
  `;
}

export function generateGatePassHTML(data: InvoiceData): string {
  const css = `
    * {margin:0; padding:0; box-sizing:border-box;}
    body{font-family: 'Segoe UI', Inter, Arial, Helvetica, sans-serif; color:#1a1a1a; margin:0; padding:0; background:#fff;}
    .sheet{width:210mm; height:297mm; margin:0 auto; padding:0; background:#fff; position:relative; display:flex; flex-direction:column;}
    
    /* Header & Footer Images - Full Width */
    .header-image{width:210mm; height:auto; display:block; margin:0; flex-shrink:0;}
    .footer-image{width:210mm; height:auto; display:block; margin:0; flex-shrink:0;}
    
    /* Content Area */
    .content-wrapper{padding:8mm 15mm; flex:1; display:flex; flex-direction:column;}
    
    /* Table Styling - Proper borders */
    table.grid{width:100%; border-collapse:collapse; margin-top:12px; border:2px solid #1e3a8a;}
    table.grid th{background:#1e3a8a; color:#fff; border:1.5px solid #1e3a8a; padding:10px 8px; font-size:12px; font-weight:600; text-align:center;}
    table.grid td{border:1px solid #4b5563; padding:8px; font-size:11px; background:#fff; vertical-align:middle; height:28px;}
    table.grid tbody tr:nth-child(even){background:#f9fafb;}
    table.grid tbody tr:hover{background:#f3f4f6;}
    
    /* Utilities */
    .small{font-size:11px; color:#6b7280; line-height:1.5;}
    .right{text-align:right;}
    
    /* Signature Section */
    .signature{margin-top:auto; padding-top:16px; display:flex; justify-content:space-between; border-top:1px dashed #9ca3af;}
    .signature > div{text-align:center; width:30%;}
    .signature .sign-line{border-bottom:1px solid #374151; margin-top:30px; margin-bottom:4px;}
    
    @media print{ 
      body{margin:0; background:#fff;} 
      .sheet{margin:0; padding:0;} 
      @page{margin:0; size:A4 portrait;}
    }
  `;

  const headerLeft = `
    <div style="width:48%;">
      <div style="padding:8px 0;">
        <div style="font-size:13px;color:#6b7280;font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Gate Pass Details</div>
        <div style="margin-bottom:10px;">
          <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Document Type</div>
          <div style="font-weight:700;color:#1e3a8a;font-size:15px;background:#f0f4ff;padding:6px 10px;border-radius:4px;display:inline-block;">GATE PASS</div>
        </div>
        <div style="margin-bottom:10px;">
          <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Gate Pass #</div>
          <div style="font-weight:700;color:#1e3a8a;font-size:16px;">${escapeHtml(data.invoiceNo || data.gpNo || "")}</div>
        </div>
        <div style="margin-bottom:10px;">
          <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Date</div>
          <div style="font-weight:600;color:#111827;font-size:14px;">${escapeHtml(data.date || "")}</div>
        </div>
      </div>
    </div>
  `;

  const headerRight = `
    <div style="width:48%; display:flex; gap:12px;">
      ${data.customer ? `
        <div style="flex:1; padding:8px 0;">
          <div style="font-size:13px;color:#6b7280;font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Party Details</div>
          <div style="font-weight:700;color:#1e3a8a;font-size:16px;margin-bottom:10px;">${escapeHtml(data.customer)}</div>
          ${data.customerPhone ? `
            <div style="margin-bottom:10px;">
              <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Phone</div>
              <div style="font-weight:600;color:#111827;font-size:14px;">${escapeHtml(data.customerPhone)}</div>
            </div>
          ` : ""}
          ${data.customerAddress ? `
            <div style="margin-bottom:10px;">
              <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Address</div>
              <div style="font-weight:500;color:#111827;font-size:14px;">${escapeHtml(data.customerAddress)}</div>
            </div>
          ` : ""}
          ${data.customerCity ? `
            <div>
              <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">City</div>
              <div style="font-weight:600;color:#111827;font-size:14px;">${escapeHtml(data.customerCity)}</div>
            </div>
          ` : ""}
        </div>
      ` : ""}
      <div style="flex:1; padding:8px; background:#fef3c7; border-left:4px solid #f59e0b; border-radius:4px; height:fit-content;">
        <div style="font-size:11px;color:#92400e;text-transform:uppercase;margin-bottom:4px;font-weight:600;">Purpose</div>
        <div style="font-size:13px;color:#111827;font-weight:600;">Material Dispatch - ${escapeHtml(data.title || "Gate Pass")}</div>
      </div>
      ${data.supplierName ? `
        <div style="padding:8px 0;">
          <div style="font-size:13px;color:#6b7280;font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Supplier Details</div>
          <div style="font-weight:700;color:#1e3a8a;font-size:16px;margin-bottom:10px;">${escapeHtml(data.supplierName)}</div>
          ${data.supplierPhone ? `
            <div style="margin-bottom:10px;">
              <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Phone</div>
              <div style="font-weight:600;color:#111827;font-size:14px;">${escapeHtml(data.supplierPhone)}</div>
            </div>
          ` : ""}
          ${data.supplierAddress ? `
            <div style="margin-bottom:10px;">
              <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Address</div>
              <div style="font-weight:500;color:#111827;font-size:14px;">${escapeHtml(data.supplierAddress)}</div>
            </div>
          ` : ""}
          ${data.supplierCity ? `
            <div>
              <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">City</div>
              <div style="font-weight:600;color:#111827;font-size:14px;">${escapeHtml(data.supplierCity)}</div>
            </div>
          ` : ""}
        </div>
      ` : ""}
    </div>
  `;

  const cols = [
    "Sr.#",
    "Item",
    "Color",
    "Thickness",
    "Length",
    "Qty",
  ];

  // Ensure minimum 8 rows
  const minRows = 8;
  const itemRows = (data.items || []).map(
    (it, idx) => {
      const qty = it.quantity ?? it.qty ?? it.lengths ?? 0;

      return `
      <tr>
        <td style="text-align:center;">${escapeHtml(it.sr ?? idx + 1)}</td>
        <td>${escapeHtml(it.itemName || it.section || it.description || "")}</td>
        <td style="text-align:center;">${escapeHtml(it.color ?? "")}</td>
        <td style="text-align:center;">${escapeHtml(it.thickness ?? "")}</td>
        <td style="text-align:center;">${escapeHtml(it.length || it.sizeFt || "")}</td>
        <td class="right">${escapeHtml(qty || "")}</td>
      </tr>
      `;
    }
  ).join("");

  // Add empty rows to reach minimum
  const emptyRowsCount = Math.max(0, minRows - (data.items?.length || 0));
  const emptyRows = Array.from({ length: emptyRowsCount })
    .map(() => `<tr>${cols.map(() => `<td style="height:28px;">&nbsp;</td>`).join("")}</tr>`)
    .join("");

  const rowsHtml = itemRows + emptyRows;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Gate Pass - ${escapeHtml(data.invoiceNo || data.gpNo || "")}</title>
    <style>${css}</style>
  </head>
  <body>
    <div class="sheet">
      <img src="/Header.png" alt="Header" class="header-image" />
      
      <div class="content-wrapper">
        <div style="display:flex; justify-content:space-between; gap:4%; margin-bottom:16px;">
          ${headerLeft}
          ${headerRight}
        </div>

        <table class="grid">
          <thead>
            <tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="margin-top:20px; padding:12px; background:#f0f9ff; border-left:4px solid #0ea5e9; border-radius:4px;">
          <div style="font-size:11px;color:#075985;text-transform:uppercase;margin-bottom:8px;font-weight:600;">Vehicle / Driver Information</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="small">Vehicle No: _______________________</div>
            <div class="small">Driver Name: _______________________</div>
          </div>
        </div>

        <div class="signature">
          <div>
            <div class="sign-line"></div>
            <div class="small" style="font-weight:600; color:#374151;">Prepared By</div>
          </div>
          <div>
            <div class="sign-line"></div>
            <div class="small" style="font-weight:600; color:#374151;">Security Officer</div>
          </div>
          <div>
            <div class="sign-line"></div>
            <div class="small" style="font-weight:600; color:#374151;">Authorized Signature</div>
          </div>
        </div>
      </div>
      
      <img src="/Footer.png" alt="Footer" class="footer-image" />
    </div>
    <script>window.onload=function(){ setTimeout(()=>{ window.print(); }, 250); }</script>
  </body>
  </html>
  `;
}
