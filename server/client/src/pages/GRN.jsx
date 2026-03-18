import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../api";
import Sidebar from "../components/common/layout/Sidebar";
import Topbar from "../components/common/layout/Topbar";

const GRN = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [grns, setGrns] = useState([]);
  const [selectedPO, setSelectedPO] = useState("");
  const [selectedPOData, setSelectedPOData] = useState(null);
  const [receivedItems, setReceivedItems] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [poRes, grnRes] = await Promise.all([
        api.get("/purchase-orders"),
        api.get("/grn"),
      ]);

      const filteredPOs = (poRes.data.purchaseOrders || []).filter(
        (po) => po.status !== "received" && po.status !== "cancelled"
      );

      setPurchaseOrders(filteredPOs);
      setGrns(grnRes.data.grns || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePurchaseOrderChange = async (e) => {
    const poId = e.target.value;
    setSelectedPO(poId);

    if (!poId) {
      setSelectedPOData(null);
      setReceivedItems([]);
      return;
    }

    try {
      const { data } = await api.get(`/purchase-orders/${poId}`);
      const po = data.purchaseOrder;

      setSelectedPOData(po);

      const initialReceivedItems = (po.items || []).map((item) => ({
        product: item.product?._id || item.product,
        productTitle: item.product?.name || "Unknown Product",
        orderedQty: item.quantity || 0,
        receivedQty: item.quantity || 0,
      }));

      setReceivedItems(initialReceivedItems);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleReceivedQtyChange = (index, value) => {
    const updatedItems = [...receivedItems];
    updatedItems[index].receivedQty = Number(value);

    setReceivedItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPO) {
      toast.error("Please select a purchase order");
      return;
    }

    if (receivedItems.length === 0) {
      toast.error("No items found for selected purchase order");
      return;
    }

    const invalidQty = receivedItems.some(
      (item) =>
        item.receivedQty < 0 ||
        item.receivedQty > item.orderedQty ||
        Number.isNaN(item.receivedQty)
    );

    if (invalidQty) {
      toast.error("Received quantity must be between 0 and ordered quantity");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        purchaseOrder: selectedPO,
        receivedItems: receivedItems.map((item) => ({
          product: item.product,
          orderedQty: item.orderedQty,
          receivedQty: item.receivedQty,
        })),
        notes: notes.trim(),
      };

      await api.post("/grn", payload);

      toast.success("GRN created successfully");

      setSelectedPO("");
      setSelectedPOData(null);
      setReceivedItems([]);
      setNotes("");

      await fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="page-content">
          <h1>GRN (Goods Receipt Note)</h1>

          <form className="form-card" onSubmit={handleSubmit}>
            <h3>Create GRN</h3>

            <div className="grid-2">
              <select value={selectedPO} onChange={handlePurchaseOrderChange}>
                <option value="">Select Purchase Order</option>
                {purchaseOrders.map((po) => (
                  <option key={po._id} value={po._id}>
                    {po.supplier?.name || "Unknown Supplier"} | {po.status} | ₹
                    {po.totalAmount ?? po.totalPrice ?? 0}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {selectedPOData && (
              <>
                <h4>Received Items</h4>

                {receivedItems.map((item, index) => (
                  <div className="grn-item-row" key={index}>
                    <input type="text" value={item.productTitle} readOnly />

                    <input type="number" value={item.orderedQty} readOnly />

                    <input
                      type="number"
                      min="0"
                      max={item.orderedQty}
                      value={item.receivedQty}
                      onChange={(e) =>
                        handleReceivedQtyChange(index, e.target.value)
                      }
                    />
                  </div>
                ))}

                <div className="button-row">
                  <button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Create GRN"}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="table-card">
            <h3>All GRNs</h3>

            {loading ? (
              <p>Loading...</p>
            ) : grns.length === 0 ? (
              <p>No GRNs found.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Purchase Order</th>
                    <th>Received Items</th>
                    <th>Notes</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {grns.map((grn) => (
                    <tr key={grn._id}>
                      <td>{grn.purchaseOrder?._id || "N/A"}</td>
                      <td>
                        {grn.receivedItems?.map((item, idx) => (
                          <div key={idx}>
                            {item.product?.name || "Unknown Product"} | Ordered:{" "}
                            {item.orderedQty} | Received: {item.receivedQty}
                          </div>
                        ))}
                      </td>
                      <td>{grn.notes || "-"}</td>
                      <td>
                        {grn.createdAt
                          ? new Date(grn.createdAt).toLocaleDateString()
                          : "-"}
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

export default GRN;
