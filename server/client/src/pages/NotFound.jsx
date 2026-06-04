import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="not-found-page" style={{ textAlign: "center", padding: "4rem" }}>
      <h1>404</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/dashboard">Go back to Dashboard</Link>
    </div>
  );
};

export default NotFound;
