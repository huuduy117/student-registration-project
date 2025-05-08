import { useState, useEffect } from "react";

export const useSession = () => {
  // Generate or retrieve tabId
  const [tabId] = useState(() => {
    const existingTabId = sessionStorage.getItem("tabId");
    if (existingTabId) return existingTabId;

    const newTabId = Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem("tabId", newTabId);
    return newTabId;
  });

  useEffect(() => {
    // Get existing tab info or create new one
    const existingTabInfo = sessionStorage.getItem(`session_${tabId}`);

    if (!existingTabInfo) {
      // Initialize new session for this tab
      const tabInfo = {
        id: tabId,
        lastActivity: Date.now(),
      };
      sessionStorage.setItem(`session_${tabId}`, JSON.stringify(tabInfo));
    }

    const handleBeforeUnload = () => {
      sessionStorage.removeItem(`session_${tabId}`);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [tabId]);

  return tabId;
};
