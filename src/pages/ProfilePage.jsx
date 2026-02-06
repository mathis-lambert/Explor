import React, { useEffect, useMemo, useState } from "react";
import {
  Sun,
  Moon,
  User,
  Heart,
  Route,
  Star,
  Ticket,
  ChevronRight,
  HelpCircle,
  Info,
  Shield,
  Award,
  MapPin,
  Clock,
  Bell,
  LogOut,
  Compass,
} from "lucide-react";
import { fetchDepartments, fetchObjectsByIds } from "../api/metApi";
import "./ProfilePage.css";

const PROFILE_SUMMARY = {
  name: "Met Explorer",
  membershipType: "Digital Member",
  memberSince: "2026",
  visitCount: 4,
  totalTimeSpent: "11h",
};

export default function ProfilePage({ state }) {
  const [favoriteArtworks, setFavoriteArtworks] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [availableInterests, setAvailableInterests] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    const loadFavoriteArtworks = async () => {
      if (!state.isLoggedIn || state.favorites.length === 0) {
        setFavoriteArtworks([]);
        return;
      }

      setIsLoadingFavorites(true);

      try {
        const artworks = await fetchObjectsByIds(state.favorites, {
          limit: state.favorites.length,
          signal: controller.signal,
        });
        setFavoriteArtworks(artworks);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setFavoriteArtworks([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingFavorites(false);
        }
      }
    };

    loadFavoriteArtworks();

    return () => controller.abort();
  }, [state.favorites, state.isLoggedIn]);

  useEffect(() => {
    const controller = new AbortController();

    const loadDepartmentInterests = async () => {
      try {
        const departments = await fetchDepartments(controller.signal);
        setAvailableInterests(
          departments.slice(0, 14).map((department) => department.displayName),
        );
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setAvailableInterests([]);
        }
      }
    };

    loadDepartmentInterests();

    return () => controller.abort();
  }, []);

  const interestOptions = useMemo(
    () =>
      availableInterests.length > 0
        ? availableInterests
        : state.preferences,
    [availableInterests, state.preferences],
  );

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  /* ---------- dark mode toggle button ---------- */
  const DarkModeToggle = () => (
    <button
      className="profile-darkmode-toggle"
      onClick={state.toggleDarkMode}
      aria-label={
        state.darkMode ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      {state.darkMode ? (
        <Sun size={20} strokeWidth={1.8} />
      ) : (
        <Moon size={20} strokeWidth={1.8} />
      )}
    </button>
  );

  /* ============================================
     GUEST (not logged in)
     ============================================ */
  if (!state.isLoggedIn) {
    return (
      <div className="page profile-page profile-guest">
        {/* ===== TOP BAR WITH DARK MODE TOGGLE ===== */}
        <div className="profile-topbar">
          <span className="profile-topbar__title">Profile</span>
          <DarkModeToggle />
        </div>

        {/* ===== GUEST HERO ===== */}
        <div className="profile-guest__hero">
          <div className="profile-guest__icon-circle">
            <User size={56} strokeWidth={1.2} />
          </div>
          <h1 className="profile-guest__title">Welcome to Explor</h1>
          <p className="profile-guest__subtitle">
            Sign in to unlock your personalized museum experience at
            The&nbsp;Met
          </p>
        </div>

        {/* ===== BENEFITS ===== */}
        <section className="profile-guest__benefits">
          <h2 className="profile-guest__benefits-heading">Member Benefits</h2>
          <div className="profile-guest__benefit">
            <span className="profile-guest__benefit-icon">
              <Heart size={20} strokeWidth={1.8} />
            </span>
            <div className="profile-guest__benefit-body">
              <span className="profile-guest__benefit-text">
                Save your favorite artworks
              </span>
              <span className="profile-guest__benefit-sub">
                Build a personal collection
              </span>
            </div>
          </div>
          <div className="profile-guest__benefit-divider" />
          <div className="profile-guest__benefit">
            <span className="profile-guest__benefit-icon">
              <Route size={20} strokeWidth={1.8} />
            </span>
            <div className="profile-guest__benefit-body">
              <span className="profile-guest__benefit-text">
                Personalized visit routes
              </span>
              <span className="profile-guest__benefit-sub">
                Curated paths through the museum
              </span>
            </div>
          </div>
          <div className="profile-guest__benefit-divider" />
          <div className="profile-guest__benefit">
            <span className="profile-guest__benefit-icon">
              <Star size={20} strokeWidth={1.8} />
            </span>
            <div className="profile-guest__benefit-body">
              <span className="profile-guest__benefit-text">
                Express your art preferences
              </span>
              <span className="profile-guest__benefit-sub">
                Tailored recommendations
              </span>
            </div>
          </div>
          <div className="profile-guest__benefit-divider" />
          <div className="profile-guest__benefit">
            <span className="profile-guest__benefit-icon">
              <Ticket size={20} strokeWidth={1.8} />
            </span>
            <div className="profile-guest__benefit-body">
              <span className="profile-guest__benefit-text">
                Quick ticket purchase
              </span>
              <span className="profile-guest__benefit-sub">
                Skip the line with mobile tickets
              </span>
            </div>
          </div>
        </section>

        {/* ===== SIGN IN ===== */}
        <div className="profile-guest__actions">
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={state.login}
          >
            Sign In
          </button>
          <button className="profile-guest__continue">Continue as Guest</button>
        </div>

        {/* ===== QUICK LINKS ===== */}
        <section className="profile-guest__links">
          <button
            className="profile-link-item"
            onClick={() => state.showToast("Help & Support coming soon")}
          >
            <HelpCircle size={20} strokeWidth={1.8} />
            <span>Help & Support</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
          <button
            className="profile-link-item"
            onClick={() => state.showToast("About The Met coming soon")}
          >
            <Info size={20} strokeWidth={1.8} />
            <span>About The Met</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
          <button
            className="profile-link-item"
            onClick={() => state.showToast("Privacy Policy coming soon")}
          >
            <Shield size={20} strokeWidth={1.8} />
            <span>Privacy Policy</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
        </section>

        {/* ===== APP VERSION ===== */}
        <footer className="profile-footer">
          <p>Explor v1.0 &mdash; The Metropolitan Museum of Art</p>
        </footer>
      </div>
    );
  }

  /* ============================================
     LOGGED IN
     ============================================ */
  return (
    <div className="page profile-page profile-logged">
      {/* ===== PROFILE HEADER ===== */}
      <header className="profile-header">
        <div className="profile-header__top-row">
          <span className="profile-header__top-label">Profile</span>
          <DarkModeToggle />
        </div>

        <div className="profile-header__avatar">
          <span className="profile-header__initials">
            {getInitials(PROFILE_SUMMARY.name)}
          </span>
        </div>
        <h1 className="profile-header__name">{PROFILE_SUMMARY.name}</h1>
        <div className="profile-header__badge">
          <Award size={14} strokeWidth={2} />
          <span>{PROFILE_SUMMARY.membershipType}</span>
        </div>
        <p className="profile-header__since">
          Member since {PROFILE_SUMMARY.memberSince}
        </p>
      </header>

      {/* ===== STATS ROW ===== */}
      <section className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat__icon">
            <MapPin size={18} strokeWidth={1.8} />
          </span>
          <span className="profile-stat__value">{PROFILE_SUMMARY.visitCount}</span>
          <span className="profile-stat__label">Visits</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__icon">
            <Clock size={18} strokeWidth={1.8} />
          </span>
          <span className="profile-stat__value">
            {PROFILE_SUMMARY.totalTimeSpent}
          </span>
          <span className="profile-stat__label">Total Time</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__icon">
            <Heart size={18} strokeWidth={1.8} />
          </span>
          <span className="profile-stat__value">{state.favorites.length}</span>
          <span className="profile-stat__label">Favorites</span>
        </div>
      </section>

      {/* ===== YOUR FAVORITES ===== */}
      <section className="profile-favorites section">
        <div className="section-header">
          <h2>
            Your Favorites
            {favoriteArtworks.length > 0 && ` (${favoriteArtworks.length})`}
          </h2>
        </div>
        {isLoadingFavorites ? (
          <div className="profile-favorites__empty">
            <p>Loading favorites from The Met API...</p>
          </div>
        ) : favoriteArtworks.length > 0 ? (
          <div className="profile-favorites__scroll">
            {favoriteArtworks.map((artwork) => (
              <button
                key={artwork.id}
                className="profile-favorite-card"
                onClick={() => state.setSelectedArtwork(artwork)}
              >
                <div className="profile-favorite-card__image-wrap">
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="profile-favorite-card__image"
                    loading="lazy"
                  />
                  <div className="profile-favorite-card__overlay" />
                  <div className="profile-favorite-card__info">
                    <p className="profile-favorite-card__title">
                      {artwork.title}
                    </p>
                    <p className="profile-favorite-card__artist">
                      {artwork.artist}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="profile-favorites__empty">
            <Heart size={32} strokeWidth={1.2} />
            <p>No favorites yet. Start exploring!</p>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => state.setActiveTab("explore")}
            >
              <Compass size={16} strokeWidth={2} />
              Explore Artworks
            </button>
          </div>
        )}
      </section>

      {/* ===== ART PREFERENCES ===== */}
      <section className="profile-preferences section">
        <div className="section-header">
          <h2>Your Art Interests</h2>
        </div>
        <p className="profile-preferences__desc">
          Tell us what you love. We'll curate your experience.
        </p>
        <div className="profile-preferences__chips">
          {interestOptions.map((style) => (
            <button
              key={style}
              className={`profile-pref-chip${state.preferences.includes(style) ? " active" : ""}`}
              onClick={() => state.togglePreference(style)}
            >
              {state.preferences.includes(style) && (
                <Star size={13} strokeWidth={2.2} />
              )}
              {style}
            </button>
          ))}
          {interestOptions.length === 0 && (
            <p style={{ color: "var(--color-text-secondary)" }}>
              Department interests are loading from The Met API.
            </p>
          )}
        </div>
      </section>

      {/* ===== ACCOUNT ACTIONS ===== */}
      <section className="profile-account section">
        <div className="section-header">
          <h2>Account</h2>
        </div>
        <div className="profile-account__menu">
          <button
            className="profile-menu-item"
            onClick={() => state.showToast("Edit Profile coming soon")}
          >
            <span className="profile-menu-item__icon-wrap">
              <User size={18} strokeWidth={1.8} />
            </span>
            <span>Edit Profile</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
          <button
            className="profile-menu-item"
            onClick={() => state.showToast("Notification Settings coming soon")}
          >
            <span className="profile-menu-item__icon-wrap">
              <Bell size={18} strokeWidth={1.8} />
            </span>
            <span>Notifications</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
          <button
            className="profile-menu-item"
            onClick={() => state.showToast("Visit History coming soon")}
          >
            <span className="profile-menu-item__icon-wrap">
              <Clock size={18} strokeWidth={1.8} />
            </span>
            <span>Visit History</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
          <button
            className="profile-menu-item"
            onClick={() => state.showToast("Help & Support coming soon")}
          >
            <span className="profile-menu-item__icon-wrap">
              <HelpCircle size={18} strokeWidth={1.8} />
            </span>
            <span>Help & Support</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
          <button
            className="profile-menu-item profile-menu-item--signout"
            onClick={state.logout}
          >
            <span className="profile-menu-item__icon-wrap profile-menu-item__icon-wrap--signout">
              <LogOut size={18} strokeWidth={1.8} />
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {/* ===== APP VERSION ===== */}
      <footer className="profile-footer">
        <p>Explor v1.0 &mdash; The Metropolitan Museum of Art</p>
      </footer>
    </div>
  );
}
