const mongoose = require("mongoose");

const purchaseOrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    items: {
      type: [purchaseOrderItemSchema],
      required: true,
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message: "At least one item is required",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "ordered", "received", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);