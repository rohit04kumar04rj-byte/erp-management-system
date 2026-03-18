import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const PageLayout = ({ title, children }) => {
  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="page-content">
          <div className="page-header">
            <h1>{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;