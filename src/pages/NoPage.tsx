import React from "react";

export default function NoPage() {
  return (
    <div
      className="flex justify-center items-center flex-col"
      style={{ height: "100%", width: "100%" }}
    >
      <h1>404</h1>
      <h3>Looks like this page doesn't exist!</h3>
    </div>
  );
}
