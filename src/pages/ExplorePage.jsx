import React, { useEffect, useMemo, useState } from "react";
import { Search, Heart, List, SearchX, ChevronDown, Grid3X3 } from "lucide-react";
import { fetchDepartments, searchArtworks } from "../api/metApi";
import "./ExplorePage.css";

/*
 * Bento grid pattern — assigns a size class per item in a repeating pattern
 * to create a Pinterest/Bento mashup. Based on artwork index.
 */
const BENTO_PATTERNS = [
  "bento-wide", // 2 cols, short
  "bento-tall", // 1 col, tall
  "bento-normal", // 1 col, normal
  "bento-normal", // 1 col, normal
  "bento-tall", // 1 col, tall
  "bento-wide", // 2 cols, short
  "bento-normal", // 1 col, normal
  "bento-normal", // 1 col, normal
  "bento-feature", // 2 cols, tall — hero
  "bento-normal", // 1 col, normal
  "bento-normal", // 1 col, normal
  "bento-tall", // 1 col, tall
];

export default function ExplorePage({ state }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeDepartment, setActiveDepartment] = useState("all");
  const [viewMode, setViewMode] = useState("bento"); // "bento" or "list"
  const [departments, setDepartments] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [resultLimit, setResultLimit] = useState(24);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 320);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();

    const loadDepartments = async () => {
      try {
        const data = await fetchDepartments(controller.signal);
        setDepartments(data);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setDepartments([]);
        }
      }
    };

    loadDepartments();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setResultLimit(24);
  }, [debouncedQuery, activeDepartment]);

  useEffect(() => {
    const controller = new AbortController();

    const loadArtworks = async () => {
      setIsLoading(true);
      setError("");

      try {
        const departmentId =
          activeDepartment === "all" ? undefined : Number(activeDepartment);

        const { artworks: data, total } = await searchArtworks({
          query: debouncedQuery || "art",
          departmentId,
          limit: resultLimit,
          signal: controller.signal,
        });

        setArtworks(data);
        setTotalResults(total);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setArtworks([]);
          setTotalResults(0);
          setError("Unable to load artworks from The Met Collection API.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadArtworks();

    return () => controller.abort();
  }, [debouncedQuery, activeDepartment, resultLimit, reloadToken]);

  const departmentFilters = useMemo(
    () => [
      { id: "all", label: "All" },
      ...departments.map((department) => ({
        id: String(department.departmentId),
        label: department.displayName,
      })),
    ],
    [departments],
  );

  const handleFavoriteClick = (event, artworkId) => {
    event.stopPropagation();
    if (!state.isLoggedIn) {
      state.showToast("Sign in to save favorites");
      return;
    }

    state.toggleFavorite(artworkId);
    state.showToast(
      state.favorites.includes(artworkId)
        ? "Removed from favorites"
        : "Added to favorites",
    );
  };

  return (
    <div className="page explore-page">
      {/* ===== HEADER ===== */}
      <header className="explore-header">
        <div className="explore-header__top">
          <h1 className="explore-header__title">Explore</h1>
          <span className="explore-header__count-badge">
            {isLoading ? "..." : totalResults.toLocaleString("en-US")}
          </span>
        </div>
        <p className="explore-header__subtitle">Live collection data from The Met API</p>
      </header>

      {/* ===== SEARCH BAR ===== */}
      <div className="explore-search">
        <div className="explore-search__inner">
          <Search size={18} strokeWidth={2} className="explore-search__icon" />
          <input
            type="text"
            className="explore-search__input"
            placeholder="Search by artist, title, keyword..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {/* ===== FILTER & VIEW CONTROLS ===== */}
      <div className="explore-toolbar">
        <div className="explore-chips__scroll">
          {departmentFilters.map((department) => (
            <button
              key={department.id}
              className={`explore-chip${activeDepartment === department.id ? " explore-chip--active" : ""}`}
              onClick={() => setActiveDepartment(department.id)}
            >
              {department.label}
            </button>
          ))}
        </div>
        <div className="explore-view-toggle">
          <button
            className={`explore-view-btn${viewMode === "bento" ? " explore-view-btn--active" : ""}`}
            onClick={() => setViewMode("bento")}
            aria-label="Bento view"
          >
            <Grid3X3 size={16} strokeWidth={1.8} />
          </button>
          <button
            className={`explore-view-btn${viewMode === "list" ? " explore-view-btn--active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* ===== ARTWORK GRID / LIST ===== */}
      <section className="explore-artworks section">
        {isLoading && (
          <div className="explore-empty">
            <p className="explore-empty__title">Loading artworks...</p>
            <p className="explore-empty__text">Fetching data from The Met Collection API.</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="explore-empty">
            <div className="explore-empty__icon">
              <SearchX size={28} strokeWidth={1.5} />
            </div>
            <p className="explore-empty__title">Unable to load artworks</p>
            <p className="explore-empty__text">{error}</p>
            <button
              className="explore-load-more__btn"
              onClick={() => setReloadToken((value) => value + 1)}
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && artworks.length === 0 && (
          <div className="explore-empty">
            <div className="explore-empty__icon">
              <SearchX size={28} strokeWidth={1.5} />
            </div>
            <p className="explore-empty__title">No artworks found</p>
            <p className="explore-empty__text">
              Try adjusting your search query or department filters.
            </p>
          </div>
        )}

        {!isLoading && !error && viewMode === "bento" && artworks.length > 0 && (
          <div className="explore-bento">
            {artworks.map((artwork, index) => {
              const isFav = state.favorites.includes(artwork.id);
              const pattern = BENTO_PATTERNS[index % BENTO_PATTERNS.length];

              return (
                <article
                  key={artwork.id}
                  className={`explore-bento__card ${pattern}`}
                  style={{ animationDelay: `${0.04 * index}s` }}
                  onClick={() => state.setSelectedArtwork(artwork)}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="explore-bento__image"
                    loading="lazy"
                  />

                  {state.isLoggedIn && (
                    <button
                      className={`explore-bento__fav${isFav ? " explore-bento__fav--active" : ""}`}
                      onClick={(event) => handleFavoriteClick(event, artwork.id)}
                      aria-label={
                        isFav ? "Remove from favorites" : "Add to favorites"
                      }
                    >
                      <Heart
                        size={14}
                        strokeWidth={isFav ? 0 : 2}
                        fill={isFav ? "#E05A54" : "none"}
                        color={isFav ? "#E05A54" : "#fff"}
                      />
                    </button>
                  )}

                  <div className="explore-bento__overlay" />
                  <div className="explore-bento__info">
                    <h3 className="explore-bento__title">{artwork.title}</h3>
                    <p className="explore-bento__artist">{artwork.artist}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!isLoading && !error && viewMode === "list" && artworks.length > 0 && (
          <div className="explore-list">
            {artworks.map((artwork, index) => {
              const isFav = state.favorites.includes(artwork.id);

              return (
                <article
                  key={artwork.id}
                  className="explore-list-card"
                  style={{ animationDelay: `${0.04 * index}s` }}
                  onClick={() => state.setSelectedArtwork(artwork)}
                >
                  <div className="explore-list-card__image-wrap">
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      className="explore-list-card__image"
                      loading="lazy"
                    />
                  </div>
                  <div className="explore-list-card__content">
                    <h3 className="explore-list-card__title">{artwork.title}</h3>
                    <p className="explore-list-card__artist">{artwork.artist}</p>
                    <div className="explore-list-card__meta">
                      <span className="explore-list-card__department">
                        {artwork.department || "Unknown Department"}
                      </span>
                      {artwork.date && <span className="explore-list-card__meta-dot" />}
                      {artwork.date && (
                        <span className="explore-list-card__date">{artwork.date}</span>
                      )}
                    </div>
                  </div>
                  <div className="explore-list-card__actions">
                    <button
                      className={`explore-list-card__fav${isFav ? " explore-list-card__fav--active" : ""}`}
                      onClick={(event) => handleFavoriteClick(event, artwork.id)}
                      aria-label={
                        isFav ? "Remove from favorites" : "Add to favorites"
                      }
                    >
                      <Heart
                        size={16}
                        strokeWidth={isFav ? 0 : 2}
                        fill={isFav ? "var(--color-error)" : "none"}
                        color={
                          isFav
                            ? "var(--color-error)"
                            : "var(--color-text-tertiary)"
                        }
                      />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== LOAD MORE ===== */}
      {!isLoading && !error && artworks.length > 0 && artworks.length < totalResults && (
        <div className="explore-load-more">
          <button
            className="explore-load-more__btn"
            onClick={() => setResultLimit((current) => current + 24)}
          >
            <ChevronDown size={16} strokeWidth={2} />
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
