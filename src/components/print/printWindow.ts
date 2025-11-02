import { renderInvoiceHTML, type InvoiceData } from "./printTemplate";
import jsPDF from "jspdf";

export function openPrintWindow(data: InvoiceData) {
  try {
    const html = renderInvoiceHTML(data);
    const w = window.open("", "_blank");
    if (!w) {
      // fallback to in-page print
      const newWin = window.open();
      if (!newWin) return undefined;
      newWin.document.write(html);
      newWin.document.close();
      return newWin;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    return w;
  } catch (err) {
    console.error("Print failed", err);
  }
}

export default openPrintWindow;

export async function downloadInvoicePdf(data: InvoiceData, filename = "invoice.pdf") {
  try {
    const html = renderInvoiceHTML(data);
    // create an offscreen container to render the HTML
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.width = "210mm"; // A4 width to help rendering
    container.innerHTML = html;
    document.body.appendChild(container);

    const doc = new jsPDF({ unit: "mm", format: "a4" });

    await new Promise<void>((resolve, reject) => {
      // jsPDF.html will render the DOM node to the PDF
      try {
        doc.html(container, {
          callback: () => {
            try {
              doc.save(filename);
            } catch (err) {
              console.error("Failed to save PDF", err);
            }
            // cleanup
            setTimeout(() => {
              if (container.parentNode) container.parentNode.removeChild(container);
              resolve();
            }, 50);
          },
          x: 0,
          y: 0,
          html2canvas: { scale: 1 },
        });
      } catch (err) {
        if (container.parentNode) container.parentNode.removeChild(container);
        reject(err);
      }
    });
  } catch (err) {
    console.error("PDF download failed", err);
  }
}
