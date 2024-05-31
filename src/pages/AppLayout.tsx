import React from "react";
import { Outlet } from "react-router-dom";
// import "./style.css";

export default function AppLayout() {
  return (
    <div>
      <div>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
