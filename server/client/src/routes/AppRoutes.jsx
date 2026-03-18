import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import Products from "../pages/Products";
import Customers from "../pages/Customers";
import Suppliers from "../pages/Suppliers";
import ProtectedRoute from "../components/common/layout/ProtectedRoute";
import SalesOrders from "../pages/SalesOrders";
import PurchaseOrders from "../pages/PurchaseOrders";
import GRN from "../pages/GRN";
import Invoices from "../pages/Invoices";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute allowedRoles={["admin", "inventory"]}>
            <Products />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute allowedRoles={["admin", "sales"]}>
            <Customers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute allowedRoles={["admin", "purchase"]}>
            <Suppliers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales-orders"
        element={
          <ProtectedRoute allowedRoles={["admin", "sales"]}>
            <SalesOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchase-orders"
        element={
          <ProtectedRoute allowedRoles={["admin", "purchase"]}>
            <PurchaseOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/grn"
        element={
          <ProtectedRoute allowedRoles={["admin", "inventory", "purchase"]}>
            <GRN />
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices"
        element={
          <ProtectedRoute allowedRoles={["admin", "sales"]}>
            <Invoices />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
