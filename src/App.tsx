import React from "react";
import { Route, Routes } from "react-router-dom";
import NoPage from "./pages/NoPage";
import AppLayout from "./pages/AppLayout";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/game" element={<GamePage />}></Route>
        <Route path="*" element={<NoPage />}></Route>
      </Route>
    </Routes>
  );
}
