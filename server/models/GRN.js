const mongoose = require("mongoose");

const grnItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderedQty: {
      type: Number,
      required: true,
      min: 1,
    },
    receivedQty: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const grnSchema = new mongoose.Schema(
  {
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
      unique: true,
    },
    receivedItems: {
      type: [grnItemSchema],
      required: true,
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message: "At least one received item is required",
      },
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    receivedDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GRN", grnSchema);