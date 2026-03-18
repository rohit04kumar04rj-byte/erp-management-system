const PDFDocument = require("pdfkit");
const Invoice = require("../models/Invoice");

exports.generateInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customer")
      .populate("salesOrder")
      .populate("items.product");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // ===== HEADER =====
    doc
      .fontSize(22)
      .text("INVOICE", { align: "center" })
      .moveDown();

    doc
      .fontSize(10)
      .text(`Invoice No: ${invoice.invoiceNumber}`)
      .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`)
      .moveDown();

    // ===== CUSTOMER =====
    doc
      .fontSize(12)
      .text("Bill To:")
      .fontSize(10)
      .text(invoice.customer?.name || "N/A")
      .moveDown();

    // ===== TABLE HEADER =====
    doc.moveDown();
    doc.fontSize(11).text("Items", { underline: true });

    let y = doc.y + 10;

    doc.fontSize(10);
    doc.text("Product", 50, y);
    doc.text("Qty", 250, y);
    doc.text("Price", 300, y);
    doc.text("Total", 400, y);

    y += 20;

    // ===== ITEMS =====
    invoice.items.forEach((item) => {
      const total = item.quantity * item.price;

      doc.text(item.product?.name || item.name, 50, y);
      doc.text(item.quantity, 250, y);
      doc.text(`₹${item.price}`, 300, y);
      doc.text(`₹${total}`, 400, y);

      y += 20;
    });

    // ===== TOTAL =====
    doc.moveDown(2);

    doc.text(`Subtotal: ₹${invoice.subtotal}`, { align: "right" });
    doc.text(
      `Tax (${invoice.taxPercent}%): ₹${invoice.taxAmount}`,
      { align: "right" }
    );
    doc
      .fontSize(12)
      .text(`Grand Total: ₹${invoice.grandTotal}`, {
        align: "right",
      });

    doc.moveDown();

    // ===== FOOTER =====
    doc
      .fontSize(10)
      .text("Thank you for your business!", {
        align: "center",
      });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};
