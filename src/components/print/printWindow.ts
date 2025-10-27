import { renderInvoiceHTML, type InvoiceData } from "./printTemplate";

export function openPrintWindow(data: InvoiceData) {
  try {
    const html = renderInvoiceHTML(data);
    const w = window.open("", "_blank");
    if (!w) {
      // fallback to in-page print
      const newWin = window.open();
      if (!newWin) return;
      newWin.document.write(html);
      newWin.document.close();
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  } catch (err) {
    console.error("Print failed", err);
  }
}

export default openPrintWindow;
