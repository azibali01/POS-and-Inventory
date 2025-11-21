interface JournalLedgerEntry {
    date: string | Date;
    documentType: string;
    documentNumber: string;
    particulars: string;
    debit: number;
    credit: number;
    balance: number;
}

interface JournalLedgerData {
    entityName: string;
    entityType: string;
    fromDate: string;
    toDate: string;
    openingBalance: number;
    closingBalance: number;
    totalDebit: number;
    totalCredit: number;
    entries: JournalLedgerEntry[];
}

export function generateJournalLedgerHTML(data: JournalLedgerData): string {
    const formatDate = (dateVal: string | Date) => {
        if (!dateVal) return "-";
        try {
            const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
            return isNaN(d.getTime()) ? String(dateVal) : d.toLocaleDateString();
        } catch {
            return String(dateVal);
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

    const entryRows = data.entries
        .map(
            (entry, idx) => `
      <tr>
        <td style="text-align: center; border: 1px solid #1e3a8a; padding: 8px;">${idx + 1}</td>
        <td style="border: 1px solid #1e3a8a; padding: 8px;">${formatDate(entry.date)}</td>
        <td style="border: 1px solid #1e3a8a; padding: 8px;">
          <div style="font-weight: 600;">${entry.documentType}</div>
          <div style="font-size: 10px; color: #666;">${entry.documentNumber}</div>
        </td>
        <td style="border: 1px solid #1e3a8a; padding: 8px;">${entry.particulars}</td>
        <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px; color: #1971c2; font-weight: 600;">
          ${entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
        </td>
        <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px; color: #f76707; font-weight: 600;">
          ${entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
        </td>
        <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px; font-weight: 700; color: ${entry.balance >= 0 ? "#2f9e44" : "#e03131"
                };">
          ${formatCurrency(Math.abs(entry.balance))} ${entry.balance >= 0 ? "CR" : "DR"}
        </td>
      </tr>
    `
        )
        .join("");

    // Pad to minimum 10 rows
    const emptyRowsNeeded = Math.max(0, 10 - data.entries.length - 2); // -2 for opening and closing
    const emptyRows = Array(emptyRowsNeeded)
        .fill(0)
        .map(
            (_, idx) => `
      <tr>
        <td style="text-align: center; border: 1px solid #1e3a8a; padding: 8px;">${data.entries.length + idx + 1}</td>
        <td style="border: 1px solid #1e3a8a; padding: 8px;">&nbsp;</td>
        <td style="border: 1px solid #1e3a8a; padding: 8px;">&nbsp;</td>
        <td style="border: 1px solid #1e3a8a; padding: 8px;">&nbsp;</td>
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
        <title>Journal Ledger - ${data.entityName}</title>
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
          .entity-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
            padding: 12px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
          }
          .entity-info div {
            flex: 1;
          }
          .entity-info label {
            font-size: 10px;
            color: #666;
            display: block;
            margin-bottom: 2px;
          }
          .entity-info span {
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
          .total-row {
            background-color: #f8f9fa !important;
            font-weight: 700;
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
          <h1>Journal Ledger Report</h1>
          <p>${dateRange}</p>
        </div>

        <div class="entity-info">
          <div>
            <label>${data.entityType}</label>
            <span>${data.entityName}</span>
          </div>
          <div>
            <label>Opening Balance</label>
            <span style="color: ${data.openingBalance >= 0 ? "#2f9e44" : "#e03131"};">
              ${formatCurrency(Math.abs(data.openingBalance))} ${data.openingBalance >= 0 ? "CR" : "DR"}
            </span>
          </div>
          <div>
            <label>Total Debit</label>
            <span style="color: #1971c2;">${formatCurrency(data.totalDebit)}</span>
          </div>
          <div>
            <label>Total Credit</label>
            <span style="color: #f76707;">${formatCurrency(data.totalCredit)}</span>
          </div>
          <div>
            <label>Closing Balance</label>
            <span style="color: ${data.closingBalance >= 0 ? "#2f9e44" : "#e03131"};">
              ${formatCurrency(Math.abs(data.closingBalance))} ${data.closingBalance >= 0 ? "CR" : "DR"}
            </span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">Sr#</th>
              <th style="width: 10%;">Date</th>
              <th style="width: 15%;">Document</th>
              <th style="width: 30%;">Particulars</th>
              <th style="width: 13%; text-align: right;">Debit</th>
              <th style="width: 13%; text-align: right;">Credit</th>
              <th style="width: 14%; text-align: right;">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr class="opening-row">
              <td colspan="6" style="text-align: left; border: 1px solid #1e3a8a; padding: 8px; font-weight: 600;">Opening Balance</td>
              <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px; font-weight: 700; color: ${data.openingBalance >= 0 ? "#2f9e44" : "#e03131"
        };">
                ${formatCurrency(Math.abs(data.openingBalance))} ${data.openingBalance >= 0 ? "CR" : "DR"}
              </td>
            </tr>
            ${entryRows}
            ${emptyRows}
            <tr class="total-row">
              <td colspan="4" style="text-align: left; border: 1px solid #1e3a8a; padding: 8px; font-weight: 700;">Total</td>
              <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px; font-weight: 700; color: #1971c2;">
                ${formatCurrency(data.totalDebit)}
              </td>
              <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px; font-weight: 700; color: #f76707;">
                ${formatCurrency(data.totalCredit)}
              </td>
              <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px;">&nbsp;</td>
            </tr>
            <tr class="closing-row">
              <td colspan="6" style="text-align: left; border: 1px solid #1e3a8a; padding: 8px; font-weight: 700;">Closing Balance</td>
              <td style="text-align: right; border: 1px solid #1e3a8a; padding: 8px; font-weight: 700; color: ${data.closingBalance >= 0 ? "#2f9e44" : "#e03131"
        };">
                ${formatCurrency(Math.abs(data.closingBalance))} ${data.closingBalance >= 0 ? "CR" : "DR"}
              </td>
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
