import React from "react";
import { ToastContainer } from "react-toastify";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  return (
    <>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default App;
