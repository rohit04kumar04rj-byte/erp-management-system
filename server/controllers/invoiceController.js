const Invoice = require("../models/Invoice");
const SalesOrder = require("../models/SalesOrder");

const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  return `INV-${timestamp}`;
};

const createInvoice = async (req, res, next) => {
  try {
    const { salesOrder: salesOrderId, taxPercent = 18, notes = "" } = req.body;

    if (!salesOrderId) {
      return res.status(400).json({
        success: false,
        message: "Sales order is required",
      });
    }

    const salesOrder = await SalesOrder.findById(salesOrderId)
      .populate("customer")
      .populate("items.product");

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    if (salesOrder.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Invoice can only be created for completed sales orders",
      });
    }

    const existingInvoice = await Invoice.findOne({ salesOrder: salesOrderId });

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: "Invoice already exists for this sales order",
      });
    }

    const invoiceItems = salesOrder.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    }));

    const subtotal = salesOrder.totalAmount;
    const taxAmount = (subtotal * taxPercent) / 100;
    const grandTotal = subtotal + taxAmount;

    const invoice = await Invoice.create({
      salesOrder: salesOrder._id,
      invoiceNumber: generateInvoiceNumber(),
      customer: {
        id: salesOrder.customer._id,
        name: salesOrder.customer.name,
        email: salesOrder.customer.email || "",
        phone: salesOrder.customer.phone || "",
        company: salesOrder.customer.company || "",
        address: salesOrder.customer.address || "",
      },
      items: invoiceItems,
      subtotal,
      taxPercent,
      taxAmount,
      grandTotal,
      notes,
      createdBy: req.user.userId,
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("salesOrder")
      .populate("items.product", "name sku category price")
      .populate("createdBy", "name email role");

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice: populatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};

const getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate("salesOrder")
      .populate("items.product", "name sku category price")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: "salesOrder",
        populate: [
          { path: "customer", select: "name email phone company address" },
          { path: "items.product", select: "name sku category price stock" },
        ],
      })
      .populate("items.product", "name sku category price")
      .populate("createdBy", "name email role");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["issued", "paid", "cancelled"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid invoice status is required",
      });
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    invoice.status = status;
    await invoice.save();

    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate("salesOrder")
      .populate("items.product", "name sku category price")
      .populate("createdBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Invoice status updated successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getSingleInvoice,
  updateInvoiceStatus,
};