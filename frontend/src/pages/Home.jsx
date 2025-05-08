"use client"

import { useEffect } from "react"
import "../assets/Home.css"
import MainContainer from "../components/mainContainer"
import NewFeed from "../components/newFeed"
import SideBar from "../components/sideBar"
import { useSessionMonitor } from "../hook/useSession"

const Home = () => {
  // Use the session monitor
  useSessionMonitor()

  useEffect(() => {
    const preventBack = (e) => {
      e.preventDefault()
      window.history.forward()
    }

    window.history.pushState(null, null, window.location.pathname)
    window.addEventListener("popstate", preventBack)

    return () => {
      window.removeEventListener("popstate", preventBack)
    }
  }, [])

  return (
    <div className="home-container">
      <SideBar />
      <MainContainer />
      <NewFeed />
    </div>
  )
}

export default Home
