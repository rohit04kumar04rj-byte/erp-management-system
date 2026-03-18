import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../AuthContext";
import Loader from "../components/common/Loader";
import Sidebar from "../components/common/layout/Sidebar";
import Topbar from "../components/common/layout/Topbar";

const LOW_STOCK_THRESHOLD = 5;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const buildRevenueSeries = (invoices) => {
  const now = new Date();
  const buckets = [];

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);

    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: MONTH_LABELS[date.getMonth()],
      revenue: 0,
    });
  }

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  invoices.forEach((invoice) => {
    const sourceDate = invoice.createdAt || invoice.issuedDate;

    if (!sourceDate) return;

    const date = new Date(sourceDate);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = bucketMap.get(key);

    if (bucket && invoice.status !== "cancelled") {
      bucket.revenue += Number(invoice.grandTotal || 0);
    }
  });

  return buckets;
};

const buildSalesStatusSeries = (salesOrders) => {
  const statusOrder = ["pending", "confirmed", "completed", "cancelled"];
  const counts = statusOrder.reduce((accumulator, status) => {
    accumulator[status] = 0;
    return accumulator;
  }, {});

  salesOrders.forEach((order) => {
    if (counts[order.status] !== undefined) {
      counts[order.status] += 1;
    }
  });

  return statusOrder.map((status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1),
    value: counts[status],
    tone: status,
  }));
};

const buildTopProductsSeries = (salesOrders) => {
  const totals = new Map();

  salesOrders
    .filter((order) => order.status === "completed")
    .forEach((order) => {
      (order.items || []).forEach((item) => {
        const productId = item.product?._id || item.product;
        const productName = item.product?.title || "Unknown Product";
        const current = totals.get(productId) || {
          id: productId,
          name: productName,
          quantity: 0,
          revenue: 0,
        };

        current.quantity += Number(item.quantity || 0);
        current.revenue += Number(item.subtotal || 0);
        totals.set(productId, current);
      });
    });

  return Array.from(totals.values())
    .sort((left, right) => right.quantity - left.quantity)
    .slice(0, 5);
};

const buildRevenuePath = (points, width, height, padding) => {
  if (points.length === 0) return "";

  const maxValue = Math.max(...points.map((point) => point.revenue), 1);
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  return points
    .map((point, index) => {
      const x =
        padding +
        (points.length === 1
          ? usableWidth / 2
          : (usableWidth / (points.length - 1)) * index);
      const y = padding + usableHeight - (point.revenue / maxValue) * usableHeight;

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

const buildRevenueDots = (points, width, height, padding) => {
  const maxValue = Math.max(...points.map((point) => point.revenue), 1);
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  return points.map((point, index) => ({
    ...point,
    x:
      padding +
      (points.length === 1
        ? usableWidth / 2
        : (usableWidth / (points.length - 1)) * index),
    y: padding + usableHeight - (point.revenue / maxValue) * usableHeight,
  }));
};

const Dashboard = () => {
  const { userInfo } = useAuth();
  const role = userInfo?.user?.role;

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    totalSalesOrders: 0,
    totalPurchaseOrders: 0,
    totalInvoices: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [salesSeries, setSalesSeries] = useState([]);
  const [topProductsSeries, setTopProductsSeries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const requests = [
          api.get("/products"),
          api.get("/customers"),
          api.get("/suppliers"),
        ];

        if (role === "admin" || role === "sales") {
          requests.push(api.get("/sales-orders"));
          requests.push(api.get("/invoices"));
        }

        if (role === "admin" || role === "purchase") {
          requests.push(api.get("/purchase-orders"));
        }

        const responses = await Promise.allSettled(requests);

        let products = [];
        let customers = [];
        let suppliers = [];
        let salesOrders = [];
        let purchaseOrders = [];
        let invoices = [];

        responses.forEach((result) => {
          if (result.status !== "fulfilled") return;

          const data = result.value.data;

          if (Array.isArray(data.products)) products = data.products;
          if (Array.isArray(data.customers)) customers = data.customers;
          if (Array.isArray(data.suppliers)) suppliers = data.suppliers;
          if (Array.isArray(data.salesOrders)) salesOrders = data.salesOrders;
          if (Array.isArray(data.purchaseOrders)) purchaseOrders = data.purchaseOrders;
          if (Array.isArray(data.invoices)) invoices = data.invoices;
        });

        const lowStock = products.filter(
          (product) => Number(product.stock) <= LOW_STOCK_THRESHOLD
        );

        const totalRevenue = invoices
          .filter((invoice) => invoice.status !== "cancelled")
          .reduce((sum, invoice) => sum + Number(invoice.grandTotal || 0), 0);

        setStats({
          totalProducts: products.length,
          totalCustomers: customers.length,
          totalSuppliers: suppliers.length,
          totalSalesOrders: salesOrders.length,
          totalPurchaseOrders: purchaseOrders.length,
          totalInvoices: invoices.length,
          lowStockProducts: lowStock.length,
          totalRevenue,
        });

        setLowStockItems(lowStock);
        setRevenueSeries(buildRevenueSeries(invoices));
        setSalesSeries(buildSalesStatusSeries(salesOrders));
        setTopProductsSeries(buildTopProductsSeries(salesOrders));
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role]);

  const statCards = [
    { title: "Total Products", value: stats.totalProducts, accent: "teal" },
    { title: "Total Customers", value: stats.totalCustomers, accent: "blue" },
    { title: "Total Suppliers", value: stats.totalSuppliers, accent: "slate" },
    { title: "Sales Orders", value: stats.totalSalesOrders, accent: "gold" },
    { title: "Purchase Orders", value: stats.totalPurchaseOrders, accent: "rose" },
    { title: "Invoices", value: stats.totalInvoices, accent: "green" },
    {
      title: "Low Stock Products",
      value: stats.lowStockProducts,
      accent: "warning",
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.totalRevenue),
      accent: "success",
    },
  ];

  const revenuePath = buildRevenuePath(revenueSeries, 640, 240, 24);
  const revenueDots = buildRevenueDots(revenueSeries, 640, 240, 24);
  const maxSalesValue = Math.max(...salesSeries.map((item) => item.value), 1);
  const maxTopProductValue = Math.max(
    ...topProductsSeries.map((item) => item.quantity),
    1
  );
  const canViewSalesInsights = role === "admin" || role === "sales";

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="page-content">
          <div className="dashboard-hero">
            <div>
              <p className="dashboard-eyebrow">Operations overview</p>
              <h1>ERP Dashboard</h1>
              <p className="dashboard-subtitle">
                Welcome, {userInfo?.user?.name}. Here&apos;s the latest snapshot for the{" "}
                {role} workflow.
              </p>
            </div>

            <div className="dashboard-highlight">
              <span>Live revenue</span>
              <strong>{formatCurrency(stats.totalRevenue)}</strong>
              <small>Based on non-cancelled invoices</small>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="stats-grid">
                {statCards.map((card) => (
                  <div
                    key={card.title}
                    className={`stat-card stat-card-${card.accent}`}
                  >
                    <h3>{card.title}</h3>
                    <p>{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="dashboard-panels">
                <div className="dashboard-panel">
                  <div className="dashboard-panel-header">
                    <div>
                      <h3>Revenue Graph</h3>
                      <p>Last 6 months invoice revenue</p>
                    </div>
                    <strong>{formatCurrency(stats.totalRevenue)}</strong>
                  </div>

                  {canViewSalesInsights ? (
                    <>
                      <div className="line-chart-card">
                        <svg
                          viewBox="0 0 640 240"
                          className="line-chart"
                          role="img"
                          aria-label="Revenue trend graph"
                        >
                          <defs>
                            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0f766e" stopOpacity="0.28" />
                              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.04" />
                            </linearGradient>
                          </defs>

                          <line x1="24" y1="216" x2="616" y2="216" className="chart-axis" />

                          {revenueSeries.map((point, index) => (
                            <text
                              key={point.label + index}
                              x={revenueDots[index]?.x || 24}
                              y="234"
                              textAnchor="middle"
                              className="chart-label"
                            >
                              {point.label}
                            </text>
                          ))}

                          {revenuePath ? (
                            <>
                              <path
                                d={`${revenuePath} L 616 216 L 24 216 Z`}
                                fill="url(#revenueFill)"
                              />
                              <path d={revenuePath} className="chart-line" />
                            </>
                          ) : null}

                          {revenueDots.map((point) => (
                            <g key={point.key}>
                              <circle cx={point.x} cy={point.y} r="5" className="chart-dot" />
                            </g>
                          ))}
                        </svg>
                      </div>

                      <div className="chart-legend">
                        {revenueSeries.map((point) => (
                          <div key={point.key} className="legend-chip">
                            <span>{point.label}</span>
                            <strong>{formatCurrency(point.revenue)}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="dashboard-empty">
                      Revenue insights are available for admin and sales users.
                    </p>
                  )}
                </div>

                <div className="dashboard-panel">
                  <div className="dashboard-panel-header">
                    <div>
                      <h3>Sales Bar Chart</h3>
                      <p>Current sales order status distribution</p>
                    </div>
                  </div>

                  {canViewSalesInsights ? (
                    <div className="bar-chart">
                      {salesSeries.map((item) => (
                        <div key={item.label} className="bar-chart-row">
                          <div className="bar-chart-meta">
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                          </div>

                          <div className="bar-chart-track">
                            <div
                              className={`bar-chart-fill bar-chart-${item.tone}`}
                              style={{
                                width: `${Math.max(
                                  (item.value / maxSalesValue) * 100,
                                  item.value ? 12 : 0
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="dashboard-empty">
                      Sales charts are available for admin and sales users.
                    </p>
                  )}
                </div>
              </div>

              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h3>Top Products Chart</h3>
                    <p>Best-selling products by completed sales quantity</p>
                  </div>
                </div>

                {canViewSalesInsights ? (
                  topProductsSeries.length > 0 ? (
                    <div className="top-products-chart">
                      {topProductsSeries.map((item, index) => (
                        <div key={item.id || item.name} className="top-products-row">
                          <div className="top-products-rank">{index + 1}</div>

                          <div className="top-products-main">
                            <div className="top-products-meta">
                              <div>
                                <strong>{item.name}</strong>
                                <span>{formatCurrency(item.revenue)} revenue</span>
                              </div>
                              <strong>{item.quantity} sold</strong>
                            </div>

                            <div className="top-products-track">
                              <div
                                className="top-products-fill"
                                style={{
                                  width: `${Math.max(
                                    (item.quantity / maxTopProductValue) * 100,
                                    14
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="dashboard-empty">
                      No completed sales yet, so top products will appear here once orders are fulfilled.
                    </p>
                  )
                ) : (
                  <p className="dashboard-empty">
                    Top product insights are available for admin and sales users.
                  </p>
                )}
              </div>

              <div className="table-card">
                <h3>Low Stock Products</h3>

                {lowStockItems.length === 0 ? (
                  <p>No low stock products found.</p>
                ) : (
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.map((product) => (
                        <tr key={product._id}>
                          <td>{product.title}</td>
                          <td>{product.sku}</td>
                          <td>{product.category}</td>
                          <td>{product.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;