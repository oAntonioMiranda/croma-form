import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./pages/FormFirstStep"
import "./index.css";
import {FormStep2} from "./pages/FormStep2";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/step2" element={<FormStep2 />} /> 
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);