import React, { useEffect, useMemo, useState } from "react";
import {
  Sun,
  Moon,
  Bell,
  Headphones,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Heart,
} from "lucide-react";
import { fetchFeaturedArtworks } from "../api/metApi";
import "./HomePage.css";

function dedupeById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

export default function HomePage({ state }) {
  const { setScreenStatus } = state;
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadHighlights = async () => {
      setIsLoading(true);
      setError("");
      setScreenStatus("home", "loading");

      try {
        const data = await fetchFeaturedArtworks({
          limit: 12,
          signal: controller.signal,
        });

        setArtworks(data);
        setScreenStatus("home", data.length > 0 ? "success" : "empty");
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError("Unable to load artworks from The Met Collection API.");
          setArtworks([]);
          setScreenStatus("home", "error");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadHighlights();

    return () => controller.abort();
  }, [reloadToken, setScreenStatus]);

  const featuredArtwork = artworks[0];
  const exhibitionArtworks = useMemo(() => artworks.slice(1, 5), [artworks]);
  const collectionArtworks = useMemo(() => artworks.slice(5, 10), [artworks]);

  const recommendedArtworks = useMemo(() => {
    if (!state.isLoggedIn) {
      return [];
    }

    const preferenceTerms = state.preferences.map((preference) =>
      preference.toLowerCase(),
    );

    const merged = dedupeById([
      ...state.recentlyViewed,
      ...artworks,
      ...collectionArtworks,
    ]);

    if (preferenceTerms.length === 0) {
      return merged.slice(0, 5);
    }

    const scored = merged
      .map((artwork) => {
        const haystack = [
          artwork.title,
          artwork.artist,
          artwork.department,
          ...(Array.isArray(artwork.tags) ? artwork.tags : []),
        ]
          .join(" ")
          .toLowerCase();

        const score = preferenceTerms.reduce(
          (total, term) => (haystack.includes(term) ? total + 1 : total),
          0,
        );

        return { artwork, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.artwork);

    return scored.slice(0, 5);
  }, [artworks, collectionArtworks, state.isLoggedIn, state.preferences, state.recentlyViewed]);

  const quickActions = [
    {
      id: "audio",
      label: "Audio Guide",
      icon: Headphones,
      onClick: () =>
        state.showToast("Audio guide mock loaded: 12 curated tracks ready."),
    },
    {
      id: "favorites",
      label: "My Favorites",
      icon: Heart,
      onClick: () => {
        if (!state.isLoggedIn) {
          state.setActiveTab("profile");
          state.showToast("Sign in to unlock your saved collection.");
          return;
        }

        state.setActiveTab("profile");
      },
    },
    {
      id: "highlights",
      label: "Highlights",
      icon: Sparkles,
      onClick: () => {
        state.setExploreControls({ query: "masterpiece", departmentId: "all" });
        state.setActiveTab("explore");
      },
    },
    {
      id: "visit",
      label: "Plan Visit",
      icon: Calendar,
      onClick: () => state.setActiveTab("tickets"),
    },
  ];

  return (
    <div className="page home-page">
      <header className="hp-header">
        <div className="hp-header__brand">
          <h1 className="hp-header__logo">Explor</h1>
          <span className="hp-header__collab-x">&times;</span>
          <img
            src="/met.svg"
            alt="The Metropolitan Museum of Art"
            className="hp-header__met-logo"
          />
        </div>
        <div className="hp-header__actions">
          <button
            className="hp-header__icon-btn"
            onClick={() => state.toggleDarkMode()}
            aria-label="Toggle dark mode"
          >
            {state.darkMode ? (
              <Sun size={20} strokeWidth={1.8} />
            ) : (
              <Moon size={20} strokeWidth={1.8} />
            )}
          </button>
          <button
            className="hp-header__icon-btn"
            onClick={() =>
              state.showToast(
                "All caught up. Next featured tour starts at 6:30 PM.",
              )
            }
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={1.8} />
            <span className="hp-header__notif-dot" />
          </button>
        </div>
      </header>

      <section className="hp-hero" style={{ animationDelay: "0.05s" }}>
        {isLoading && (
          <div className="hp-hero__card skeleton" aria-hidden="true" />
        )}

        {!isLoading && featuredArtwork && (
          <div
            className="hp-hero__card"
            onClick={() => state.setSelectedArtwork(featuredArtwork)}
          >
            <img
              src={featuredArtwork.image}
              alt={featuredArtwork.title}
              className="hp-hero__image"
              loading="lazy"
            />
            <div className="hp-hero__overlay" />
            <div className="hp-hero__content">
              <span className="hp-hero__overline">Featured Today</span>
              <h2 className="hp-hero__title">{featuredArtwork.title}</h2>
              <p className="hp-hero__artist">
                {featuredArtwork.artist}
                {featuredArtwork.date ? `, ${featuredArtwork.date}` : ""}
              </p>
              <button className="hp-hero__cta">
                <span>Explore</span>
                <ArrowRight size={16} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        )}

        {!isLoading && !featuredArtwork && (
          <div className="hp-hero__card">
            <div className="hp-hero__overlay" />
            <div className="hp-hero__content">
              <span className="hp-hero__overline">The Met Collection API</span>
              <h2 className="hp-hero__title">No featured artwork found</h2>
              <p className="hp-hero__artist">
                {error || "Try loading a new API batch."}
              </p>
              <button
                className="hp-hero__cta"
                onClick={() => setReloadToken((value) => value + 1)}
              >
                <span>Retry</span>
                <ArrowRight size={16} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="hp-actions" style={{ animationDelay: "0.1s" }}>
        <div className="hp-actions__scroll">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button key={action.id} className="hp-action" onClick={action.onClick}>
                <span className="hp-action__circle">
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <span className="hp-action__label">{action.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="hp-exhibitions" style={{ animationDelay: "0.15s" }}>
        <div className="hp-section-header">
          <div className="hp-section-header__left">
            <span className="hp-section-header__overline">Live From The Met</span>
            <h2 className="hp-section-header__title">Highlights</h2>
          </div>
          <button
            className="hp-section-header__link"
            onClick={() => state.setActiveTab("explore")}
          >
            See All
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
        <div className="hp-exhibitions__scroll">
          {isLoading && Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="hp-exhibit-card skeleton" aria-hidden="true" />
          ))}

          {!isLoading && exhibitionArtworks.length === 0 && (
            <p
              style={{
                padding: "0 var(--space-lg)",
                color: "var(--color-text-secondary)",
              }}
            >
              No highlights available right now.
            </p>
          )}

          {!isLoading &&
            exhibitionArtworks.map((artwork) => (
              <article
                key={artwork.id}
                className="hp-exhibit-card"
                onClick={() => state.setSelectedArtwork(artwork)}
              >
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="hp-exhibit-card__image"
                  loading="lazy"
                />
                <div className="hp-exhibit-card__overlay" />
                <span className="hp-exhibit-card__tag hp-exhibit-card__tag--featured">
                  {artwork.department || "Collection"}
                </span>
                <div className="hp-exhibit-card__content">
                  <h3 className="hp-exhibit-card__title">{artwork.title}</h3>
                  <p className="hp-exhibit-card__dates">
                    {artwork.date || "Open Access Collection"}
                  </p>
                </div>
              </article>
            ))}
        </div>
      </section>

      {state.isLoggedIn && (
        <section className="hp-exhibitions" style={{ animationDelay: "0.18s" }}>
          <div className="hp-section-header">
            <div className="hp-section-header__left">
              <span className="hp-section-header__overline">For You</span>
              <h2 className="hp-section-header__title">Recommended</h2>
            </div>
            <button
              className="hp-section-header__link"
              onClick={() => state.setActiveTab("profile")}
            >
              Profile
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="hp-exhibitions__scroll">
            {recommendedArtworks.length === 0 && (
              <p
                style={{
                  padding: "0 var(--space-lg)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Save artworks and choose interests to unlock recommendations.
              </p>
            )}

            {recommendedArtworks.map((artwork) => (
              <article
                key={artwork.id}
                className="hp-exhibit-card"
                onClick={() => state.setSelectedArtwork(artwork)}
              >
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="hp-exhibit-card__image"
                  loading="lazy"
                />
                <div className="hp-exhibit-card__overlay" />
                <span className="hp-exhibit-card__tag hp-exhibit-card__tag--new">
                  Recommended
                </span>
                <div className="hp-exhibit-card__content">
                  <h3 className="hp-exhibit-card__title">{artwork.title}</h3>
                  <p className="hp-exhibit-card__dates">{artwork.artist}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="hp-collection" style={{ animationDelay: "0.2s" }}>
        <div className="hp-section-header hp-section-header--padded">
          <div className="hp-section-header__left">
            <span className="hp-section-header__overline">The Collection</span>
            <h2 className="hp-section-header__title">Masterpieces</h2>
          </div>
          <button
            className="hp-section-header__link"
            onClick={() => state.setActiveTab("explore")}
          >
            See All
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
        <div className="hp-collection__grid">
          {isLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`hp-masterpiece skeleton ${index === 0 ? "hp-masterpiece--hero" : ""}`}
                aria-hidden="true"
              />
            ))}

          {!isLoading &&
            collectionArtworks.map((artwork, index) => (
              <article
                key={artwork.id}
                className={`hp-masterpiece ${index === 0 ? "hp-masterpiece--hero" : ""}`}
                onClick={() => state.setSelectedArtwork(artwork)}
              >
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="hp-masterpiece__image"
                  loading="lazy"
                />
                <div className="hp-masterpiece__overlay" />
                <div className="hp-masterpiece__content">
                  <h3 className="hp-masterpiece__title">{artwork.title}</h3>
                  <p className="hp-masterpiece__artist">{artwork.artist}</p>
                </div>
              </article>
            ))}

          {!isLoading && collectionArtworks.length === 0 && (
            <p
              style={{
                gridColumn: "1 / -1",
                color: "var(--color-text-secondary)",
              }}
            >
              No collection items were returned by the API.
            </p>
          )}
        </div>
      </section>

      <section className="hp-visit" style={{ animationDelay: "0.25s" }}>
        <div className="hp-visit__card">
          <div className="hp-visit__decoration" />
          <div className="hp-visit__content">
            <span className="hp-visit__overline">Plan Your Visit</span>
            <h2 className="hp-visit__title">
              Experience Art
              <br />
              That Moves You
            </h2>
            <p className="hp-visit__subtitle">
              Reserve your tickets today and explore over 5,000 years of art from around the world.
            </p>
            <button
              className="hp-visit__cta"
              onClick={() => state.setActiveTab("tickets")}
            >
              <span>Get Tickets</span>
              <ArrowRight size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
