"use client"

import { useState, useEffect } from "react"

export const useSession = () => {
  // Generate or retrieve tabId
  const [tabId] = useState(() => {
    const existingTabId = sessionStorage.getItem("tabId")
    if (existingTabId) return existingTabId

    const newTabId = Math.random().toString(36).substring(2, 9)
    sessionStorage.setItem("tabId", newTabId)
    return newTabId
  })

  useEffect(() => {
    // Get existing tab info or create new one
    const existingTabInfo = sessionStorage.getItem(`session_${tabId}`)

    if (!existingTabInfo) {
      // Initialize new session for this tab
      const tabInfo = {
        id: tabId,
        lastActivity: Date.now(),
      }
      sessionStorage.setItem(`session_${tabId}`, JSON.stringify(tabInfo))
    }

    // Set up activity tracking
    const updateActivity = () => {
      const tabInfo = JSON.parse(sessionStorage.getItem(`session_${tabId}`) || "{}")
      if (tabInfo) {
        tabInfo.lastActivity = Date.now()
        sessionStorage.setItem(`session_${tabId}`, JSON.stringify(tabInfo))
      }

      // Also update auth data if it exists
      const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")
      if (authData && authData.token) {
        authData.lastActivity = Date.now()
        sessionStorage.setItem(`auth_${tabId}`, JSON.stringify(authData))
      }
    }

    // Update activity on user interactions
    window.addEventListener("click", updateActivity)
    window.addEventListener("keydown", updateActivity)
    window.addEventListener("mousemove", updateActivity)

    const handleBeforeUnload = () => {
      sessionStorage.removeItem(`session_${tabId}`)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("click", updateActivity)
      window.removeEventListener("keydown", updateActivity)
      window.removeEventListener("mousemove", updateActivity)
    }
  }, [tabId])

  return tabId
}

// Add a new hook for session monitoring
export const useSessionMonitor = () => {
  const tabId = useSession()

  useEffect(() => {
    const checkSession = () => {
      const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")

      if (!authData || !authData.token || !authData.username) {
        console.warn("Invalid auth data, skipping session check.");
        return;
      }

      // Check if this user is logged in elsewhere with a newer timestamp
      const allKeys = Object.keys(sessionStorage)
      const authKeys = allKeys.filter((key) => key.startsWith("auth_") && key !== `auth_${tabId}`)

      for (const key of authKeys) {
        try {
          const otherAuthData = JSON.parse(sessionStorage.getItem(key) || "{}")

          if (
            otherAuthData &&
            otherAuthData.username === authData.username &&
            otherAuthData.lastActivity > authData.lastActivity
          ) {
            // Found a newer session for the same user
            console.log("Duplicate login detected, logging out...")
            sessionStorage.removeItem(`auth_${tabId}`)
            sessionStorage.setItem("logout_reason", "duplicate_login")
            window.location.href = "/login"
            return
          }
        } catch (error) {
          console.error("Error parsing session data:", error)
        }
      }
    }

    const interval = setInterval(checkSession, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [tabId])
}
