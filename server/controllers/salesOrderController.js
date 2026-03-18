const SalesOrder = require("../models/SalesOrder");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

const createSalesOrder = async (req, res, next) => {
  try {
    const { customer, items, notes } = req.body;

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer and at least one item are required",
      });
    }

    const existingCustomer = await Customer.findById(customer);
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
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

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`,
        });
      }

      const subtotal = product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });

      totalAmount += subtotal;
    }

    const salesOrder = await SalesOrder.create({
      customer,
      items: orderItems,
      totalAmount,
      notes,
      createdBy: req.user.userId,
    });

    const populatedOrder = await SalesOrder.findById(salesOrder._id)
      .populate("customer", "name email phone company")
      .populate("items.product", "name sku category price");

    res.status(201).json({
      success: true,
      message: "Sales order created successfully",
      salesOrder: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const getAllSalesOrders = async (req, res, next) => {
  try {
    const salesOrders = await SalesOrder.find()
      .populate("customer", "name email phone company")
      .populate("items.product", "name sku category price")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: salesOrders.length,
      salesOrders,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleSalesOrder = async (req, res, next) => {
  try {
    const salesOrder = await SalesOrder.findById(req.params.id)
      .populate("customer", "name email phone company address")
      .populate("items.product", "name sku category price stock")
      .populate("createdBy", "name email role");

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    res.status(200).json({
      success: true,
      salesOrder,
    });
  } catch (error) {
    next(error);
  }
};

const updateSalesOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required",
      });
    }

    const salesOrder = await SalesOrder.findById(req.params.id).populate("items.product");

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    if (salesOrder.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed order cannot be changed",
      });
    }

    if (salesOrder.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be changed",
      });
    }

    if (status === "completed") {
      for (const item of salesOrder.items) {
        const product = await Product.findById(item.product._id);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.product._id}`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`,
          });
        }

        product.stock -= item.quantity;
        await product.save();
      }
    }

    salesOrder.status = status;
    await salesOrder.save();

    const updatedOrder = await SalesOrder.findById(salesOrder._id)
      .populate("customer", "name email phone company")
      .populate("items.product", "name sku category price stock")
      .populate("createdBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Sales order status updated successfully",
      salesOrder: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSalesOrder = async (req, res, next) => {
  try {
    const salesOrder = await SalesOrder.findById(req.params.id);

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    if (salesOrder.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed order cannot be deleted",
      });
    }

    await salesOrder.deleteOne();

    res.status(200).json({
      success: true,
      message: "Sales order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSalesOrder,
  getAllSalesOrders,
  getSingleSalesOrder,
  updateSalesOrderStatus,
  deleteSalesOrder,
};