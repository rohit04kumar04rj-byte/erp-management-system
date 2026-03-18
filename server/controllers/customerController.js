const Customer = require("../models/Customer");

const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      company,
      address,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, address } = req.body;

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    customer.name = name ?? customer.name;
    customer.email = email ?? customer.email;
    customer.phone = phone ?? customer.phone;
    customer.company = company ?? customer.company;
    customer.address = address ?? customer.address;

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
};