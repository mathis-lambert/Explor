import { useState, useCallback, useEffect } from "react";
import { readPersistedState, writePersistedState } from "../utils/localState";

const DEFAULT_SCREEN_STATUS = {
  home: "idle",
  explore: "idle",
  map: "idle",
  tickets: "idle",
  profile: "idle",
};

function toRecentItem(artwork) {
  if (!artwork || !artwork.id) {
    return null;
  }

  return {
    id: artwork.id,
    title: artwork.title,
    artist: artwork.artist,
    image: artwork.image,
    department: artwork.department,
    date: artwork.date,
    sourceUrl: artwork.sourceUrl || "",
  };
}

export function useAppState() {
  const persisted = readPersistedState();

  const [activeTab, setActiveTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(persisted.isLoggedIn);
  const [favorites, setFavorites] = useState(persisted.favorites);
  const [preferences, setPreferences] = useState(persisted.preferences);
  const [savedRoutes, setSavedRoutes] = useState(persisted.savedRoutes);
  const [recentlyViewed, setRecentlyViewed] = useState(persisted.recentlyViewed);
  const [exploreControls, setExploreControlsState] = useState(
    persisted.exploreControls,
  );
  const [selectedArtwork, setSelectedArtworkState] = useState(null);
  const [showTicketCheckout, setShowTicketCheckout] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mapFocusDepartmentName, setMapFocusDepartmentName] = useState("");
  const [uiStatusByScreen, setUiStatusByScreen] = useState(DEFAULT_SCREEN_STATUS);
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

  useEffect(() => {
    writePersistedState({
      isLoggedIn,
      favorites,
      preferences,
      savedRoutes,
      recentlyViewed,
      exploreControls,
    });
  }, [
    isLoggedIn,
    favorites,
    preferences,
    savedRoutes,
    recentlyViewed,
    exploreControls,
  ]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const setScreenStatus = useCallback((screen, status) => {
    setUiStatusByScreen((previous) => {
      if (previous[screen] === status) {
        return previous;
      }

      return {
        ...previous,
        [screen]: status,
      };
    });
  }, []);

  const toggleFavorite = useCallback((artworkId) => {
    setFavorites((previous) => {
      if (previous.includes(artworkId)) {
        return previous.filter((id) => id !== artworkId);
      }
      return [...previous, artworkId];
    });
  }, []);

  const togglePreference = useCallback((preference) => {
    setPreferences((previous) => {
      if (previous.includes(preference)) {
        return previous.filter((item) => item !== preference);
      }

      return [...previous, preference];
    });
  }, []);

  const setExploreControls = useCallback((updates) => {
    setExploreControlsState((previous) => ({
      ...previous,
      ...updates,
    }));
  }, []);

  const saveRoute = useCallback((route) => {
    if (!route || !route.id) {
      return;
    }

    setSavedRoutes((previous) => [
      route,
      ...previous.filter((item) => item.id !== route.id),
    ]);
  }, []);

  const clearSavedRoute = useCallback((routeId) => {
    setSavedRoutes((previous) => previous.filter((route) => route.id !== routeId));
  }, []);

  const addRecentlyViewed = useCallback((artwork) => {
    const recentItem = toRecentItem(artwork);

    if (!recentItem) {
      return;
    }

    setRecentlyViewed((previous) => {
      const next = [recentItem, ...previous.filter((item) => item.id !== recentItem.id)];
      return next.slice(0, 20);
    });
  }, []);

  const setSelectedArtwork = useCallback(
    (artwork) => {
      setSelectedArtworkState(artwork);
      if (artwork) {
        addRecentlyViewed(artwork);
      }
    },
    [addRecentlyViewed],
  );

  const login = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setFavorites([]);
    setPreferences([]);
    setSavedRoutes([]);
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
    savedRoutes,
    saveRoute,
    clearSavedRoute,
    recentlyViewed,
    addRecentlyViewed,
    exploreControls,
    setExploreControls,
    selectedArtwork,
    setSelectedArtwork,
    showTicketCheckout,
    setShowTicketCheckout,
    toast,
    showToast,
    selectedRoute,
    setSelectedRoute,
    mapFocusDepartmentName,
    setMapFocusDepartmentName,
    uiStatusByScreen,
    setScreenStatus,
    darkMode,
    toggleDarkMode,
  };
}
