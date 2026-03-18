const GRN = require("../models/GRN");
const PurchaseOrder = require("../models/PurchaseOrder");
const Product = require("../models/Product");

const createGRN = async (req, res, next) => {
  try {
    const { purchaseOrder, receivedItems, notes } = req.body;

    if (
      !purchaseOrder ||
      !receivedItems ||
      !Array.isArray(receivedItems) ||
      receivedItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Purchase order and received items are required",
      });
    }

    const existingPO = await PurchaseOrder.findById(purchaseOrder).populate("items.product");

    if (!existingPO) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    if (existingPO.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot create GRN for cancelled purchase order",
      });
    }

    if (existingPO.status === "received") {
      return res.status(400).json({
        success: false,
        message: "GRN already processed for this purchase order",
      });
    }

    const existingGRN = await GRN.findOne({ purchaseOrder });

    if (existingGRN) {
      return res.status(400).json({
        success: false,
        message: "GRN already exists for this purchase order",
      });
    }

    const poItemsMap = new Map();
    for (const item of existingPO.items) {
      poItemsMap.set(item.product._id.toString(), item.quantity);
    }

    let finalReceivedItems = [];

    for (const item of receivedItems) {
      const productId = item.product;
      const orderedQty = poItemsMap.get(productId);

      if (!orderedQty) {
        return res.status(400).json({
          success: false,
          message: `Product ${productId} does not belong to this purchase order`,
        });
      }

      if (item.receivedQty === undefined || item.receivedQty < 0) {
        return res.status(400).json({
          success: false,
          message: "Received quantity must be 0 or more",
        });
      }

      if (item.receivedQty > orderedQty) {
        return res.status(400).json({
          success: false,
          message: `Received quantity cannot exceed ordered quantity for product ${productId}`,
        });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`,
        });
      }

      product.stock += item.receivedQty;
      await product.save();

      finalReceivedItems.push({
        product: product._id,
        orderedQty,
        receivedQty: item.receivedQty,
      });
    }

    const grn = await GRN.create({
      purchaseOrder,
      receivedItems: finalReceivedItems,
      notes,
      createdBy: req.user.userId,
    });

    existingPO.status = "received";
    await existingPO.save();

    const populatedGRN = await GRN.findById(grn._id)
      .populate("purchaseOrder")
      .populate("receivedItems.product", "name sku category price stock")
      .populate("createdBy", "name email role");

    res.status(201).json({
      success: true,
      message: "GRN created successfully and stock updated",
      grn: populatedGRN,
    });
  } catch (error) {
    next(error);
  }
};

const getAllGRNs = async (req, res, next) => {
  try {
    const grns = await GRN.find()
      .populate("purchaseOrder")
      .populate("receivedItems.product", "name sku category price stock")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: grns.length,
      grns,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleGRN = async (req, res, next) => {
  try {
    const grn = await GRN.findById(req.params.id)
      .populate({
        path: "purchaseOrder",
        populate: [
          { path: "supplier", select: "name email phone company address" },
          { path: "items.product", select: "name sku category price stock" },
        ],
      })
      .populate("receivedItems.product", "name sku category price stock")
      .populate("createdBy", "name email role");

    if (!grn) {
      return res.status(404).json({
        success: false,
        message: "GRN not found",
      });
    }

    res.status(200).json({
      success: true,
      grn,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGRN,
  getAllGRNs,
  getSingleGRN,
};