const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
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

const invoiceSchema = new mongoose.Schema(
  {
    salesOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesOrder",
      required: true,
      unique: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        default: "",
        trim: true,
      },
      phone: {
        type: String,
        default: "",
        trim: true,
      },
      company: {
        type: String,
        default: "",
        trim: true,
      },
      address: {
        type: String,
        default: "",
        trim: true,
      },
    },
    items: {
      type: [invoiceItemSchema],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxPercent: {
      type: Number,
      default: 18,
      min: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["issued", "paid", "cancelled"],
      default: "issued",
    },
    issuedDate: {
      type: Date,
      default: Date.now,
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

module.exports = mongoose.model("Invoice", invoiceSchema);