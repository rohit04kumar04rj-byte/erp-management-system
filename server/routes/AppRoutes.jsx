import Customers from "../pages/Customers";
import Suppliers from "../pages/Suppliers";

<Route
  path="/suppliers"
  element={
    <ProtectedRoute allowedRoles={["admin", "purchase"]}>
      <Suppliers />
    </ProtectedRoute>
  }
/>