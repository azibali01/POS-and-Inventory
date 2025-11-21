interface StockMovement {
    date: string;
    type: string;
    refNo: string;
    qtyIn: number;
    qtyOut: number;
    rate: number;
    balance: number;
}

interface StockLedgerData {
    productName: string;
    productCode: string;
    category: string;
    unit: string;
    fromDate: string;
    toDate: string;
    openingStock: number;
    closingStock: number;
    movements: StockMovement[];
}

export function generateStockLedgerHTML(data: StockLedgerData): string {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
        } catch {
            return dateStr;
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-PK", {
            style: "currency",
            currency: "PKR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    const dateRange = data.fromDate || data.toDate
        ? `${data.fromDate ? formatDate(data.fromDate) : "Start"} to ${data.toDate ? formatDate(data.toDate) : "End"}`
        : "All Time";

    const movementRows = data.movements
        .map(
            (m, idx) => `
      <tr>
        <td style="text-align: center; border: 1px solid #1e3a8a; padding: 8px;">${idx + 1}</td>
        <td style="border: 1px solid #1e3a8a; padding: 8px;">${formatDate(m.date)}</td>
        <td style="border: 1px solid #1e3a8a; padding: 8px; font-weight: 600; color: ${m.type === "Purchase" ? "#2b8a3e" : "#c92a2a"
                };">${m.type}</td>
        <td style="border: 1px solid #1e3a8a; padding: 8px;">${m.refNo}</td>
        <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px;">${m.qtyIn > 0 ? m.qtyIn : "-"
                }</td>
        <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px;">${m.qtyOut > 0 ? m.qtyOut : "-"
                }</td>
        <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px;">${formatCurrency(m.rate)}</td>
        <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px; font-weight: 700;">${m.balance}</td>
      </tr>
    `
        )
        .join("");

    // Pad to minimum 10 rows
    const emptyRowsNeeded = Math.max(0, 10 - data.movements.length - 2); // -2 for opening and closing
    const emptyRows = Array(emptyRowsNeeded)
        .fill(0)
        .map(
            (_, idx) => `
      <tr>
        <td style="text-align: center; border: 1px solid #1e3a8a; padding: 8px;">${data.movements.length + idx + 1}</td>
        <td style="border: 1px solid #1e3a8a; padding: 8px;">&nbsp;</td>
        <td style="border: 1px solid #1e3a8a; padding: 8px;">&nbsp;</td>
        <td style="border: 1px solid #1e3a8a; padding: 8px;">&nbsp;</td>
        <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px;">&nbsp;</td>
        <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px;">&nbsp;</td>
        <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px;">&nbsp;</td>
        <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px;">&nbsp;</td>
      </tr>
    `
        )
        .join("");

    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Stock Ledger - ${data.productName}</title>
        <style>
          @media print {
            @page {
              margin: 0.5cm;
            }
            body {
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            font-size: 12px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #1e3a8a;
          }
          .header p {
            margin: 4px 0;
            font-size: 14px;
            color: #666;
          }
          .product-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
            padding: 12px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
          }
          .product-info div {
            flex: 1;
          }
          .product-info label {
            font-size: 10px;
            color: #666;
            display: block;
            margin-bottom: 2px;
          }
          .product-info span {
            font-size: 13px;
            font-weight: 600;
            color: #000;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #1e3a8a;
            color: white;
            padding: 10px 8px;
            text-align: left;
            border: 1px solid #1e3a8a;
            font-size: 11px;
            font-weight: 600;
          }
          td {
            font-size: 11px;
          }
          .opening-row {
            background-color: #fff3bf !important;
            font-weight: 600;
          }
          .closing-row {
            background-color: #e7f5ff !important;
            font-weight: 700;
            color: #1e3a8a;
          }
          .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
          }
          .signature-box {
            width: 30%;
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 40px;
            padding-top: 4px;
          }
        </style>
      </head>
      <body onload="window.print()">
        <div class="header">
          <h1>Stock Ledger Report</h1>
          <p>${dateRange}</p>
        </div>

        <div class="product-info">
          <div>
            <label>Product Name</label>
            <span>${data.productName}</span>
          </div>
          <div>
            <label>Product Code</label>
            <span>${data.productCode}</span>
          </div>
          <div>
            <label>Category</label>
            <span>${data.category}</span>
          </div>
          <div>
            <label>Unit</label>
            <span>${data.unit}</span>
          </div>
          <div>
            <label>Opening Stock</label>
            <span>${data.openingStock} ${data.unit}</span>
          </div>
          <div>
            <label>Closing Stock</label>
            <span style="color: #1e3a8a;">${data.closingStock} ${data.unit}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">Sr#</th>
              <th style="width: 12%;">Date</th>
              <th style="width: 12%;">Type</th>
              <th style="width: 15%;">Ref No</th>
              <th style="width: 10%; text-align: right;">Qty In</th>
              <th style="width: 10%; text-align: right;">Qty Out</th>
              <th style="width: 15%; text-align: right;">Rate</th>
              <th style="width: 12%; text-align: right;">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr class="opening-row">
              <td colspan="7" style="text-align: left; border: 1px solid #1e3a8a; padding: 8px; font-weight: 600;">Opening Stock</td>
              <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px; font-weight: 700;">${data.openingStock}</td>
            </tr>
            ${movementRows}
            ${emptyRows}
            <tr class="closing-row">
              <td colspan="7" style="text-align: left; border: 1px solid #1e3a8a; padding: 8px; font-weight: 700;">Closing Stock</td>
              <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px; font-weight: 700;">${data.closingStock}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div class="signature-box">
            <div class="signature-line">Prepared By</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Checked By</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Approved By</div>
          </div>
        </div>
      </body>
    </html>
  `;
}
