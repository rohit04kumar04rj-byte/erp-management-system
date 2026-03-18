const Supplier = require("../models/Supplier");

const createSupplier = async (req, res, next) => {
  try {
    const { name, email, phone, company, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const supplier = await Supplier.create({
      name,
      email,
      phone,
      company,
      address,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    next(error);
  }
};

const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      supplier,
    });
  } catch (error) {
    next(error);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const { name, email, phone, company, address } = req.body;

    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    supplier.name = name ?? supplier.name;
    supplier.email = email ?? supplier.email;
    supplier.phone = phone ?? supplier.phone;
    supplier.company = company ?? supplier.company;
    supplier.address = address ?? supplier.address;

    await supplier.save();

    res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    await supplier.deleteOne();

    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSingleSupplier,
  updateSupplier,
  deleteSupplier,
};