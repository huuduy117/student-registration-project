"use client"

import { useState } from "react"
import "../assets/SideBar.css"
import { useNavigate, Link } from "react-router-dom"
import { FaSignOutAlt, FaBars, FaTimes, FaHome, FaBook, FaCalendar, FaCog, FaComments } from "react-icons/fa"

export default function SideBar() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    navigate("/", { replace: true })
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const menuItems = [
    { icon: <FaHome />, text: "Home", path: "/home" },
    { icon: <FaComments />, text: "Chat", path: "/chat" },
    { icon: <FaBook />, text: "Courses", path: "#" },
    { icon: <FaCalendar />, text: "Schedule", path: "#" },
    { icon: <FaCog />, text: "Settings", path: "#" },
  ]

  return (
    <>
      <button className="mobile-menu-button" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`side-bar-wrapper ${isMenuOpen ? "menu-open" : ""}`}>
        <div className="side-bar-header">
          <img alt="avatar" src="https://placehold.co/52x52/png" className="side-bar-avatar" />
          <div className="side-bar-user-name">{localStorage.getItem("username") || "Adu User"}</div>
        </div>
        <nav className="side-bar-main">
          {menuItems.map((item, index) => (
            <Link key={index} to={item.path} className="menu-item">
              <span className="menu-item-icon">{item.icon}</span>
              <span className="menu-item-text">{item.text}</span>
            </Link>
          ))}
        </nav>

        <div className="side-bar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <span className="menu-item-icon">
              <FaSignOutAlt />
            </span>
            <span className="menu-item-text">Log out</span>
          </button>
        </div>
      </div>

      {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
    </>
  )
}
