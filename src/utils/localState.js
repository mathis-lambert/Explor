const STORAGE_KEY = "explor-prototype-state-v1";

const DEFAULT_PERSISTED_STATE = {
  isLoggedIn: false,
  favorites: [],
  preferences: [],
  savedRoutes: [],
  recentlyViewed: [],
  exploreControls: {
    query: "",
    departmentId: "all",
    sortBy: "relevance",
    viewMode: "bento",
  },
};

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeExploreControls(value) {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_PERSISTED_STATE.exploreControls };
  }

  return {
    query: typeof value.query === "string" ? value.query : "",
    departmentId:
      typeof value.departmentId === "string" ? value.departmentId : "all",
    sortBy: typeof value.sortBy === "string" ? value.sortBy : "relevance",
    viewMode: value.viewMode === "list" ? "list" : "bento",
  };
}

export function readPersistedState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { ...DEFAULT_PERSISTED_STATE };
  }

  const parsed = safeParse(raw);
  if (!parsed || typeof parsed !== "object") {
    return { ...DEFAULT_PERSISTED_STATE };
  }

  return {
    isLoggedIn: Boolean(parsed.isLoggedIn),
    favorites: normalizeArray(parsed.favorites),
    preferences: normalizeArray(parsed.preferences),
    savedRoutes: normalizeArray(parsed.savedRoutes),
    recentlyViewed: normalizeArray(parsed.recentlyViewed),
    exploreControls: normalizeExploreControls(parsed.exploreControls),
  };
}

export function writePersistedState(partialState) {
  const current = readPersistedState();
  const next = {
    ...current,
    ...partialState,
    exploreControls: normalizeExploreControls(
      partialState?.exploreControls ?? current.exploreControls,
    ),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearPersistedState() {
  localStorage.removeItem(STORAGE_KEY);
}
