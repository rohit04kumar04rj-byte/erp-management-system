import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../api";
import Sidebar from "../components/common/layout/Sidebar";
import Topbar from "../components/common/layout/Topbar";

const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

const Invoices = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState("");
  const [taxPercent, setTaxPercent] = useState(18);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState("");
  const [pdfLoadingId, setPdfLoadingId] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      const [salesOrdersRes, invoicesRes] = await Promise.all([
        api.get("/sales-orders"),
        api.get("/invoices"),
      ]);

      const allInvoices = invoicesRes.data.invoices || [];

      const invoicedSalesOrderIds = new Set(
        allInvoices.map(
          (inv) => inv.salesOrder?._id || inv.salesOrder
        )
      );

      const completedOrders = (salesOrdersRes.data.salesOrders || []).filter(
        (order) =>
          order.status === "completed" &&
          !invoicedSalesOrderIds.has(order._id)
      );

      setSalesOrders(completedOrders);
      setInvoices(allInvoices);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSalesOrder) {
      toast.error("Please select a completed sales order");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/invoices", {
        salesOrder: selectedSalesOrder,
        taxPercent: Number(taxPercent),
        notes: notes.trim(),
      });

      toast.success("Invoice created successfully");

      setSelectedSalesOrder("");
      setTaxPercent(18);
      setNotes("");

      await fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setStatusLoadingId(id);

      await api.put(`/invoices/${id}`, { status });

      toast.success(
        status === "paid"
          ? "Invoice marked as paid"
          : "Invoice cancelled"
      );

      await fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setStatusLoadingId("");
    }
  };

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      setPdfLoadingId(id);

      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `${invoiceNumber || `invoice-${id}`}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to download invoice PDF");
    } finally {
      setPdfLoadingId("");
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="page-content">
          <h1>Invoices</h1>

          {/* CREATE FORM */}
          <form className="form-card" onSubmit={handleSubmit}>
            <h3>Create Invoice</h3>

            <div className="grid-2">
              <select
                value={selectedSalesOrder}
                onChange={(e) => setSelectedSalesOrder(e.target.value)}
              >
                <option value="">Select Completed Sales Order</option>

                {salesOrders.map((order) => (
                  <option key={order._id} value={order._id}>
                    {order.customer?.name || "Unknown"} |{" "}
                    {formatCurrency(order.totalAmount ?? order.totalPrice)}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Tax %"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
              />

              <input
                type="text"
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="button-row">
              <button
                type="submit"
                disabled={submitting || salesOrders.length === 0}
              >
                {submitting ? "Saving..." : "Create Invoice"}
              </button>
            </div>

            {!loading && salesOrders.length === 0 && (
              <p>All completed sales orders are already invoiced.</p>
            )}
          </form>

          {/* TABLE */}
          <div className="table-card">
            <h3>All Invoices</h3>

            {loading ? (
              <p>Loading...</p>
            ) : invoices.length === 0 ? (
              <p>No invoices found.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>Sales Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => {
                    const isUpdating = statusLoadingId === invoice._id;
                    const isDownloadingPDF = pdfLoadingId === invoice._id;
                    const isPaid = invoice.status === "paid";
                    const isCancelled = invoice.status === "cancelled";

                    return (
                      <tr key={invoice._id}>
                        <td>{invoice.invoiceNumber}</td>

                        <td>
                          {invoice.salesOrder?._id?.slice(-6) || "-"}
                        </td>

                        <td>{invoice.customer?.name || "-"}</td>

                        <td>
                          {invoice.items?.map((item, idx) => (
                            <div key={idx}>
                              {item.product?.name || item.name || "Item"} ×{" "}
                              {item.quantity}
                            </div>
                          ))}
                        </td>

                        <td>
                          <div>
                            Subtotal: {formatCurrency(invoice.subtotal)}
                          </div>
                          <div>
                            Tax: {invoice.taxPercent}% (
                            {formatCurrency(invoice.taxAmount)})
                          </div>
                          <div>
                            <strong>
                              Grand Total:{" "}
                              {formatCurrency(invoice.grandTotal)}
                            </strong>
                          </div>
                        </td>

                        <td>{invoice.status}</td>

                        <td>
                          <div className="status-actions">
                            {/* ✅ PDF BUTTON */}
                            <button
                              type="button"
                              disabled={isDownloadingPDF}
                              onClick={() =>
                                handleDownloadPDF(
                                  invoice._id,
                                  invoice.invoiceNumber
                                )
                              }
                            >
                              {isDownloadingPDF ? "Downloading..." : "PDF"}
                            </button>

                            <button
                              type="button"
                              disabled={isUpdating || isPaid || isCancelled}
                              onClick={() =>
                                handleStatusUpdate(invoice._id, "paid")
                              }
                            >
                              {isUpdating ? "Saving..." : "Paid"}
                            </button>

                            <button
                              type="button"
                              className="delete-btn"
                              disabled={isUpdating || isPaid || isCancelled}
                              onClick={() =>
                                handleStatusUpdate(invoice._id, "cancelled")
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
