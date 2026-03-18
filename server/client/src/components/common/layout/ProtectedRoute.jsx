import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import Loader from "../Loader";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userInfo, loading } = useAuth();

  if (loading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userInfo?.user?.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;