const Product = require("../models/Product");

// Create product
const createProduct = async (req, res, next) => {
  try {
    const { name, sku, category, price, stock, description } = req.body;

    if (!name || !sku || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const existingProduct = await Product.findOne({ sku });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product with this SKU already exists",
      });
    }

    const product = await Product.create({
      name,
      sku,
      category,
      price,
      stock,
      description,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Get all products
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Get single product
const getSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Update product
const updateProduct = async (req, res, next) => {
  try {
    const { name, sku, category, price, stock, description } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (sku && sku !== product.sku) {
      const existingSku = await Product.findOne({ sku });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: "Another product with this SKU already exists",
        });
      }
    }

    product.name = name ?? product.name;
    product.sku = sku ?? product.sku;
    product.category = category ?? product.category;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;
    product.description = description ?? product.description;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};