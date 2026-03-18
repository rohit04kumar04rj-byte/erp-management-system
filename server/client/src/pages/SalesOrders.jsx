import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../api";
import Sidebar from "../components/common/layout/Sidebar";
import Topbar from "../components/common/layout/Topbar";

const initialFormData = {
  customer: "",
  notes: "",
  items: [{ product: "", quantity: 1 }],
};

const SalesOrders = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [customersRes, productsRes, salesOrdersRes] = await Promise.all([
        api.get("/customers"),
        api.get("/products"),
        api.get("/sales-orders"),
      ]);

      setCustomers(Array.isArray(customersRes.data.customers) ? customersRes.data.customers : []);
      setProducts(Array.isArray(productsRes.data.products) ? productsRes.data.products : []);
      setSalesOrders(Array.isArray(salesOrdersRes.data.salesOrders) ? salesOrdersRes.data.salesOrders : []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCustomerChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      customer: e.target.value,
    }));
  };

  const handleNotesChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      notes: e.target.value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = field === "quantity" ? Number(value) : value;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product: "", quantity: 1 }],
    }));
  };

  const removeItemRow = (index) => {
    if (formData.items.length === 1) return;

    const updatedItems = formData.items.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const getProductById = (productId) => {
    return products.find((product) => product._id === productId);
  };

  const orderTotal = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      const product = getProductById(item.product);
      return sum + (product?.price || 0) * (Number(item.quantity) || 0);
    }, 0);
  }, [formData.items, products]);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer) {
      toast.error("Please select a customer");
      return;
    }

    if (!formData.items.length) {
      toast.error("Please add at least one item");
      return;
    }

    const hasInvalidItem = formData.items.some(
      (item) => !item.product || !item.quantity || Number(item.quantity) < 1
    );

    if (hasInvalidItem) {
      toast.error("Please fill all item details correctly");
      return;
    }

    const payloadItems = formData.items.map((item) => {
      const productDetails = getProductById(item.product);

      return {
        product: item.product,
        quantity: Number(item.quantity),
        price: Number(productDetails?.price),
      };
    });

    const hasMissingProduct = payloadItems.some(
      (item) => !item.product || Number.isNaN(item.price) || item.price < 0
    );
    if (hasMissingProduct) {
      toast.error("One or more selected products are invalid");
      return;
    }

    const payload = {
      customer: formData.customer,
      notes: formData.notes.trim(),
      items: payloadItems,
    };

    try {
      setSubmitting(true);

      await api.post("/sales-orders", payload);

      toast.success("Sales order created successfully");
      resetForm();
      await fetchInitialData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/sales-orders/${id}`, { status });
      toast.success("Sales order status updated");
      await fetchInitialData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="page-content">
          <h1>Sales Orders</h1>

          <form className="form-card" onSubmit={handleSubmit}>
            <h3>Create Sales Order</h3>

            <div className="grid-2">
              <select value={formData.customer} onChange={handleCustomerChange}>
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleNotesChange}
              />
            </div>

            <h4>Order Items</h4>

            {formData.items.map((item, index) => {
              const selectedProduct = getProductById(item.product);
              const itemSubtotal =
                (selectedProduct?.price || 0) * (Number(item.quantity) || 0);

              return (
                <div className="order-item-row" key={index}>
                  <select
                    value={item.product}
                    onChange={(e) =>
                      handleItemChange(index, "product", e.target.value)
                    }
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option
                        key={product._id}
                        value={product._id}
                        disabled={Number(product.stock) === 0}
                      >
                        {product.name} | Stock: {product.stock} | ₹{product.price}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    placeholder="Quantity"
                  />

                  <div style={{ minWidth: "120px", alignSelf: "center" }}>
                    ₹{itemSubtotal}
                  </div>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => removeItemRow(index)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}

            <p>
              <strong>Total: ₹{orderTotal}</strong>
            </p>

            <div className="button-row">
              <button type="button" onClick={addItemRow}>
                Add Item
              </button>

              <button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Create Sales Order"}
              </button>
            </div>
          </form>

          <div className="table-card">
            <h3>All Sales Orders</h3>

            {loading ? (
              <p>Loading...</p>
            ) : salesOrders.length === 0 ? (
              <p>No sales orders found.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {salesOrders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.customer?.name || "N/A"}</td>
                      <td>
                        {order.items?.map((item, idx) => (
                          <div key={idx}>
                            {item.product?.name || "Unknown Product"} × {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td>₹{order.totalAmount ?? order.totalPrice ?? 0}</td>
                      <td>{order.status}</td>
                      <td>{order.notes || "-"}</td>
                      <td>
                        <div className="status-actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusUpdate(order._id, "confirmed")
                            }
                          >
                            Confirm
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusUpdate(order._id, "completed")
                            }
                          >
                            Complete
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              handleStatusUpdate(order._id, "cancelled")
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrders;
