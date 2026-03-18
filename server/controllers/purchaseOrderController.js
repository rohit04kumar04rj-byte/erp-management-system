const PurchaseOrder = require("../models/PurchaseOrder");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");

const createPurchaseOrder = async (req, res, next) => {
  try {
    const { supplier, items, notes } = req.body;

    if (!supplier || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Supplier and at least one item are required",
      });
    }

    const existingSupplier = await Supplier.findById(supplier);

    if (!existingSupplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    let orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be at least 1",
        });
      }

      if (item.costPrice === undefined || item.costPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Valid cost price is required",
        });
      }

      const subtotal = item.costPrice * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        costPrice: item.costPrice,
        subtotal,
      });

      totalAmount += subtotal;
    }

    const purchaseOrder = await PurchaseOrder.create({
      supplier,
      items: orderItems,
      totalAmount,
      notes,
      createdBy: req.user.userId,
    });

    const populatedOrder = await PurchaseOrder.findById(purchaseOrder._id)
      .populate("supplier", "name email phone company")
      .populate("items.product", "name sku category price stock");

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      purchaseOrder: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const getAllPurchaseOrders = async (req, res, next) => {
  try {
    const purchaseOrders = await PurchaseOrder.find()
      .populate("supplier", "name email phone company")
      .populate("items.product", "name sku category price stock")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: purchaseOrders.length,
      purchaseOrders,
    });
  } catch (error) {
    next(error);
  }
};

const getSinglePurchaseOrder = async (req, res, next) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate("supplier", "name email phone company address")
      .populate("items.product", "name sku category price stock")
      .populate("createdBy", "name email role");

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    res.status(200).json({
      success: true,
      purchaseOrder,
    });
  } catch (error) {
    next(error);
  }
};

const updatePurchaseOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "approved", "ordered", "received", "cancelled"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required",
      });
    }

    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    if (purchaseOrder.status === "received") {
      return res.status(400).json({
        success: false,
        message: "Received order cannot be changed here",
      });
    }

    if (purchaseOrder.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be changed",
      });
    }

    purchaseOrder.status = status;
    await purchaseOrder.save();

    const updatedOrder = await PurchaseOrder.findById(purchaseOrder._id)
      .populate("supplier", "name email phone company")
      .populate("items.product", "name sku category price stock")
      .populate("createdBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Purchase order status updated successfully",
      purchaseOrder: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const deletePurchaseOrder = async (req, res, next) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    if (purchaseOrder.status === "received") {
      return res.status(400).json({
        success: false,
        message: "Received purchase order cannot be deleted",
      });
    }

    await purchaseOrder.deleteOne();

    res.status(200).json({
      success: true,
      message: "Purchase order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getSinglePurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
};