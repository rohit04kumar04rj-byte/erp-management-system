import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../api";
import Sidebar from "../components/common/layout/Sidebar";
import Topbar from "../components/common/layout/Topbar";

const initialFormData = {
  supplier: "",
  notes: "",
  items: [{ product: "", quantity: 1, costPrice: "" }],
};

const PurchaseOrders = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [suppliersRes, productsRes, purchaseOrdersRes] =
        await Promise.all([
          api.get("/suppliers"),
          api.get("/products"),
          api.get("/purchase-orders"),
        ]);

      setSuppliers(suppliersRes.data.suppliers || []);
      setProducts(productsRes.data.products || []);
      setPurchaseOrders(purchaseOrdersRes.data.purchaseOrders || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSupplierChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      supplier: e.target.value,
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
    updatedItems[index][field] =
      field === "quantity" || field === "costPrice"
        ? Number(value)
        : value;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product: "", quantity: 1, costPrice: "" }],
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

  const getProductById = (id) => {
    return products.find((p) => p._id === id);
  };

  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      return sum + (item.costPrice || 0) * (item.quantity || 0);
    }, 0);
  }, [formData.items]);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supplier) {
      toast.error("Please select a supplier");
      return;
    }

    const hasInvalidItem = formData.items.some(
      (item) =>
        !item.product ||
        !item.quantity ||
        item.quantity < 1 ||
        item.costPrice === "" ||
        item.costPrice < 0
    );

    if (hasInvalidItem) {
      toast.error("Please fill all item details correctly");
      return;
    }

    const payload = {
      supplier: formData.supplier,
      notes: formData.notes.trim(),
      items: formData.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        costPrice: item.costPrice,
      })),
    };

    try {
      setSubmitting(true);

      await api.post("/purchase-orders", payload);

      toast.success("Purchase order created successfully");
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
      await api.put(`/purchase-orders/${id}`, { status });
      toast.success("Purchase order status updated");
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
          <h1>Purchase Orders</h1>

          <form className="form-card" onSubmit={handleSubmit}>
            <h3>Create Purchase Order</h3>

            <div className="grid-2">
              <select
                value={formData.supplier}
                onChange={handleSupplierChange}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name} - {supplier.phone}
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

            {formData.items.map((item, index) => (
              <div className="purchase-item-row" key={index}>
                <select
                  value={item.product}
                  onChange={(e) =>
                    handleItemChange(index, "product", e.target.value)
                  }
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} | Stock: {product.stock}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                />

                <input
                  type="number"
                  min="0"
                  placeholder="Cost Price"
                  value={item.costPrice}
                  onChange={(e) =>
                    handleItemChange(index, "costPrice", e.target.value)
                  }
                />

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => removeItemRow(index)}
                >
                  Remove
                </button>
              </div>
            ))}

            <p>
              <strong>Total: ₹{totalAmount}</strong>
            </p>

            <div className="button-row">
              <button type="button" onClick={addItemRow}>
                Add Item
              </button>

              <button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Create Purchase Order"}
              </button>
            </div>
          </form>

          <div className="table-card">
            <h3>All Purchase Orders</h3>

            {loading ? (
              <p>Loading...</p>
            ) : purchaseOrders.length === 0 ? (
              <p>No purchase orders found.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {purchaseOrders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.supplier?.name}</td>
                      <td>
                        {order.items?.map((item, idx) => (
                          <div key={idx}>
                            {item.product?.name || "Unknown Product"} × {item.quantity} @ ₹
                            {item.costPrice}
                          </div>
                        ))}
                      </td>
                      <td>
                        ₹{order.totalAmount ?? order.totalPrice ?? 0}
                      </td>
                      <td>{order.status}</td>
                      <td>{order.notes}</td>
                      <td>
                        <div className="status-actions">
                          <button
                            onClick={() =>
                              handleStatusUpdate(order._id, "approved")
                            }
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              handleStatusUpdate(order._id, "ordered")
                            }
                          >
                            Ordered
                          </button>

                          <button
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

export default PurchaseOrders;
