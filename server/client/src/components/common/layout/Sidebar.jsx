import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../AuthContext";

const Sidebar = () => {
  const { userInfo } = useAuth();
  const role = userInfo?.user?.role;

  const linkClassName = ({ isActive }) =>
    isActive ? "sidebar-link active" : "sidebar-link";

  return (
    <div className="sidebar">
      <h2>ERP</h2>

      <NavLink to="/dashboard" className={linkClassName}>
        Dashboard
      </NavLink>

      {(role === "admin" || role === "inventory") && (
        <NavLink to="/products" className={linkClassName}>
          Products
        </NavLink>
      )}

      {(role === "admin" || role === "sales") && (
        <NavLink to="/customers" className={linkClassName}>
          Customers
        </NavLink>
      )}

      {(role === "admin" || role === "purchase") && (
        <NavLink to="/suppliers" className={linkClassName}>
          Suppliers
        </NavLink>
      )}

      {(role === "admin" || role === "sales") && (
        <NavLink to="/sales-orders" className={linkClassName}>
          Sales Orders
        </NavLink>
      )}

      {(role === "admin" || role === "purchase") && (
        <NavLink to="/purchase-orders" className={linkClassName}>
          Purchase Orders
        </NavLink>
      )}

      {(role === "admin" || role === "inventory" || role === "purchase") && (
        <NavLink to="/grn" className={linkClassName}>
          GRN
        </NavLink>
      )}

      {(role === "admin" || role === "sales") && (
        <NavLink to="/invoices" className={linkClassName}>
          Invoices
        </NavLink>
      )}
    </div>
  );
};

export default Sidebar;