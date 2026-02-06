import { useState, useCallback, useEffect } from "react";

export function useAppState() {
  const [activeTab, setActiveTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showTicketCheckout, setShowTicketCheckout] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("explor-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
    localStorage.setItem("explor-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const toggleFavorite = useCallback((artworkId) => {
    setFavorites((prev) => {
      if (prev.includes(artworkId)) {
        return prev.filter((id) => id !== artworkId);
      }
      return [...prev, artworkId];
    });
  }, []);

  const togglePreference = useCallback((pref) => {
    setPreferences((prev) => {
      if (prev.includes(pref)) {
        return prev.filter((p) => p !== pref);
      }
      return [...prev, pref];
    });
  }, []);

  const login = useCallback(() => {
    setIsLoggedIn(true);
    setFavorites([]);
    setPreferences([]);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setFavorites([]);
    setPreferences([]);
  }, []);

  return {
    activeTab,
    setActiveTab,
    isLoggedIn,
    login,
    logout,
    favorites,
    toggleFavorite,
    preferences,
    togglePreference,
    selectedArtwork,
    setSelectedArtwork,
    showTicketCheckout,
    setShowTicketCheckout,
    toast,
    showToast,
    selectedRoute,
    setSelectedRoute,
    darkMode,
    toggleDarkMode,
  };
}
