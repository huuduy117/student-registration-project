import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        {/* Route mặc định khi vào "/" */}
        <Route path="/" element={<Login />} />{" "}
        {/* Hoặc bạn có thể điều hướng đến trang khác */}
      </Routes>
    </Router>
  );
};

export default App;
