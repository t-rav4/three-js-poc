import React from "react";
import { Route, Routes } from "react-router-dom";
import NoPage from "./pages/NoPage";
import AppLayout from "./pages/AppLayout";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import WorldPage from "./other_world/WorldPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/secret" element={<WorldPage />} />
        <Route path="*" element={<NoPage />} />
      </Route>
    </Routes>
  );
}
