import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div
      className="card"
      onClick={() => {
        navigate("/game");
      }}
    >
      <h2>Game</h2>
    </div>
  );
}
