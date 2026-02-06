import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Heart,
  List,
  SearchX,
  ChevronDown,
  Grid3X3,
  ArrowDownUp,
} from "lucide-react";
import { fetchDepartments, searchArtworks } from "../api/metApi";
import SortSheet from "../components/SortSheet";
import "./ExplorePage.css";

const BENTO_PATTERNS = [
  "bento-wide",
  "bento-tall",
  "bento-normal",
  "bento-normal",
  "bento-tall",
  "bento-wide",
  "bento-normal",
  "bento-normal",
  "bento-feature",
  "bento-normal",
  "bento-normal",
  "bento-tall",
];

function sortArtworks(items, sortBy) {
  const clone = [...items];

  if (sortBy === "title") {
    return clone.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sortBy === "artist") {
    return clone.sort((a, b) => a.artist.localeCompare(b.artist));
  }

  if (sortBy === "newest") {
    return clone.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  return clone;
}

export default function ExplorePage({ state }) {
  const { setScreenStatus } = state;
  const { query, departmentId, viewMode, sortBy } = state.exploreControls;

  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());
  const [departments, setDepartments] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [resultLimit, setResultLimit] = useState(24);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 320);

    return () => clearTimeout(timeout);
  }, [query]);

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
  }, [debouncedQuery, departmentId]);

  useEffect(() => {
    const controller = new AbortController();

    const loadArtworks = async () => {
      if (!debouncedQuery && departmentId === "all") {
        setArtworks([]);
        setTotalResults(0);
        setError("");
        setIsLoading(false);
        setScreenStatus("explore", "empty");
        return;
      }

      setIsLoading(true);
      setError("");
      setScreenStatus("explore", "loading");

      try {
        const selectedDepartmentId =
          departmentId === "all" ? undefined : Number(departmentId);

        const { artworks: data, total } = await searchArtworks({
          query: debouncedQuery || "art",
          departmentId: selectedDepartmentId,
          limit: resultLimit,
          signal: controller.signal,
        });

        setArtworks(data);
        setTotalResults(total);

        if (data.length === 0) {
          setScreenStatus("explore", "empty");
        } else {
          setScreenStatus("explore", "success");
        }
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setArtworks([]);
          setTotalResults(0);
          setError("Unable to load artworks from The Met Collection API.");
          setScreenStatus("explore", "error");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadArtworks();

    return () => controller.abort();
  }, [
    debouncedQuery,
    departmentId,
    resultLimit,
    reloadToken,
    setScreenStatus,
  ]);

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

  const sortedArtworks = useMemo(
    () => sortArtworks(artworks, sortBy),
    [artworks, sortBy],
  );

  const hasNoQuery = !debouncedQuery && departmentId === "all";

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

  const handleOpenArtwork = (artwork) => {
    state.setSelectedArtwork(artwork);
  };

  return (
    <div className="page explore-page">
      <header className="explore-header">
        <div className="explore-header__top">
          <h1 className="explore-header__title">Explor</h1>
          <span className="explore-header__count-badge">
            {isLoading ? "..." : totalResults.toLocaleString("en-US")}
          </span>
        </div>
        <p className="explore-header__subtitle">Live collection data from The Met API</p>
      </header>

      <div className="explore-search">
        <div className="explore-search__inner">
          <Search size={18} strokeWidth={2} className="explore-search__icon" />
          <input
            type="text"
            className="explore-search__input"
            placeholder="Search by artist, title, keyword..."
            value={query}
            onChange={(event) =>
              state.setExploreControls({ query: event.target.value })
            }
          />
        </div>
      </div>

      <div className="explore-toolbar">
        <div className="explore-chips__scroll">
          {departmentFilters.map((department) => (
            <button
              key={department.id}
              className={`explore-chip${departmentId === department.id ? " explore-chip--active" : ""}`}
              onClick={() =>
                state.setExploreControls({ departmentId: department.id })
              }
            >
              {department.label}
            </button>
          ))}
        </div>
        <button
          className="explore-sort-btn"
          onClick={() => setIsSortOpen(true)}
          aria-label="Sort artworks"
        >
          <ArrowDownUp size={16} strokeWidth={1.8} />
        </button>
        <div className="explore-view-toggle">
          <button
            className={`explore-view-btn${viewMode === "bento" ? " explore-view-btn--active" : ""}`}
            onClick={() => state.setExploreControls({ viewMode: "bento" })}
            aria-label="Bento view"
          >
            <Grid3X3 size={16} strokeWidth={1.8} />
          </button>
          <button
            className={`explore-view-btn${viewMode === "list" ? " explore-view-btn--active" : ""}`}
            onClick={() => state.setExploreControls({ viewMode: "list" })}
            aria-label="List view"
          >
            <List size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {!isLoading && !error && !hasNoQuery && sortedArtworks.length > 0 && (
        <div className="explore-results-meta section">
          <p>
            Showing {sortedArtworks.length} of {totalResults.toLocaleString("en-US")} results
          </p>
        </div>
      )}

      <section className="explore-artworks section">
        {isLoading && (
          <div className="explore-bento" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`explore-bento__card skeleton ${BENTO_PATTERNS[index % BENTO_PATTERNS.length]}`}
              />
            ))}
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

        {!isLoading && !error && hasNoQuery && (
          <div className="explore-empty">
            <div className="explore-empty__icon">
              <Search size={26} strokeWidth={1.7} />
            </div>
            <p className="explore-empty__title">Start with a search</p>
            <p className="explore-empty__text">
              Type an artist, movement, or title to begin exploring the collection.
            </p>
          </div>
        )}

        {!isLoading && !error && !hasNoQuery && sortedArtworks.length === 0 && (
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

        {!isLoading && !error && viewMode === "bento" && sortedArtworks.length > 0 && (
          <div className="explore-bento">
            {sortedArtworks.map((artwork, index) => {
              const isFav = state.favorites.includes(artwork.id);
              const pattern = BENTO_PATTERNS[index % BENTO_PATTERNS.length];

              return (
                <article
                  key={artwork.id}
                  className={`explore-bento__card ${pattern}`}
                  style={{ animationDelay: `${0.04 * index}s` }}
                  onClick={() => handleOpenArtwork(artwork)}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="explore-bento__image"
                    loading="lazy"
                  />

                  <button
                    className={`explore-bento__fav${isFav ? " explore-bento__fav--active" : ""}`}
                    onClick={(event) => handleFavoriteClick(event, artwork.id)}
                    aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      size={14}
                      strokeWidth={isFav ? 0 : 2}
                      fill={isFav ? "#E05A54" : "none"}
                      color={isFav ? "#E05A54" : "#fff"}
                    />
                  </button>

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

        {!isLoading && !error && viewMode === "list" && sortedArtworks.length > 0 && (
          <div className="explore-list">
            {sortedArtworks.map((artwork, index) => {
              const isFav = state.favorites.includes(artwork.id);

              return (
                <article
                  key={artwork.id}
                  className="explore-list-card"
                  style={{ animationDelay: `${0.04 * index}s` }}
                  onClick={() => handleOpenArtwork(artwork)}
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
                      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
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

      {!isLoading && !error && sortedArtworks.length > 0 && sortedArtworks.length < totalResults && (
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

      {isSortOpen && (
        <SortSheet
          value={sortBy}
          onChange={(nextSortBy) => state.setExploreControls({ sortBy: nextSortBy })}
          onClose={() => setIsSortOpen(false)}
        />
      )}
    </div>
  );
}
