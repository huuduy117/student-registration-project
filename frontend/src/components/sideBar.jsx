import "../assets/SideBar.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";

export default function SideBar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <div className="side-bar-wrapper">
      <div className="side-bar-header">
        <img
          alt="avatar"
          src="https://placehold.co/52x52/png"
          className="side-bar-avatar"
        />
        <div className="side-bar-user-name">Adu User</div>
      </div>
      <div className="side-bar-main">
        <div className="side-bar-fnc1">Function 1</div>
        <div className="side-bar-fnc2">Function 2</div>
        <div className="side-bar-fnc3">Function 3</div>
        <div className="side-bar-fnc4">Function 4</div>
      </div>
      <div className="side-bar-footer">
        <button className="logout-button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}
