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
  Trash2,
  Eye,
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
  const { isLoggedIn, favorites, savedRoutes, setScreenStatus } = state;
  const [favoriteArtworks, setFavoriteArtworks] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [availableInterests, setAvailableInterests] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    const loadFavoriteArtworks = async () => {
      if (!isLoggedIn || favorites.length === 0) {
        setFavoriteArtworks([]);
        return;
      }

      setIsLoadingFavorites(true);

      try {
        const artworks = await fetchObjectsByIds(favorites, {
          limit: favorites.length,
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
  }, [favorites, isLoggedIn]);

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

  useEffect(() => {
    if (!isLoggedIn) {
      setScreenStatus("profile", "success");
      return;
    }

    if (isLoadingFavorites) {
      setScreenStatus("profile", "loading");
      return;
    }

    if (favorites.length === 0 && savedRoutes.length === 0) {
      setScreenStatus("profile", "empty");
      return;
    }

    setScreenStatus("profile", "success");
  }, [favorites.length, isLoadingFavorites, isLoggedIn, savedRoutes.length, setScreenStatus]);

  const interestOptions = useMemo(
    () =>
      availableInterests.length > 0 ? availableInterests : state.preferences,
    [availableInterests, state.preferences],
  );

  const getInitials = (name) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const DarkModeToggle = () => (
    <button
      className="profile-darkmode-toggle"
      onClick={state.toggleDarkMode}
      aria-label={state.darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {state.darkMode ? (
        <Sun size={20} strokeWidth={1.8} />
      ) : (
        <Moon size={20} strokeWidth={1.8} />
      )}
    </button>
  );

  if (!state.isLoggedIn) {
    return (
      <div className="page profile-page profile-guest">
        <div className="profile-topbar">
          <span className="profile-topbar__title">Profile</span>
          <DarkModeToggle />
        </div>

        <div className="profile-guest__hero">
          <div className="profile-guest__icon-circle">
            <User size={56} strokeWidth={1.2} />
          </div>
          <h1 className="profile-guest__title">Welcome to Explor</h1>
          <p className="profile-guest__subtitle">
            Sign in to unlock your personalized museum experience at The Met
          </p>
        </div>

        <section className="profile-guest__benefits">
          <h2 className="profile-guest__benefits-heading">Member Benefits</h2>
          <div className="profile-guest__benefit">
            <span className="profile-guest__benefit-icon">
              <Heart size={20} strokeWidth={1.8} />
            </span>
            <div className="profile-guest__benefit-body">
              <span className="profile-guest__benefit-text">Save your favorite artworks</span>
              <span className="profile-guest__benefit-sub">Build a personal collection</span>
            </div>
          </div>
          <div className="profile-guest__benefit-divider" />
          <div className="profile-guest__benefit">
            <span className="profile-guest__benefit-icon">
              <Route size={20} strokeWidth={1.8} />
            </span>
            <div className="profile-guest__benefit-body">
              <span className="profile-guest__benefit-text">Personalized visit routes</span>
              <span className="profile-guest__benefit-sub">Curated paths through the museum</span>
            </div>
          </div>
          <div className="profile-guest__benefit-divider" />
          <div className="profile-guest__benefit">
            <span className="profile-guest__benefit-icon">
              <Star size={20} strokeWidth={1.8} />
            </span>
            <div className="profile-guest__benefit-body">
              <span className="profile-guest__benefit-text">Express your art preferences</span>
              <span className="profile-guest__benefit-sub">Tailored recommendations</span>
            </div>
          </div>
          <div className="profile-guest__benefit-divider" />
          <div className="profile-guest__benefit">
            <span className="profile-guest__benefit-icon">
              <Ticket size={20} strokeWidth={1.8} />
            </span>
            <div className="profile-guest__benefit-body">
              <span className="profile-guest__benefit-text">Quick ticket purchase</span>
              <span className="profile-guest__benefit-sub">Skip the line with mobile tickets</span>
            </div>
          </div>
        </section>

        <div className="profile-guest__actions">
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={() => {
              state.login();
              state.showToast("Signed in. Your profile is now personalized.");
            }}
          >
            Sign In
          </button>
          <button
            className="profile-guest__continue"
            onClick={() => {
              state.setActiveTab("home");
              state.showToast("Browsing as guest");
            }}
          >
            Continue as Guest
          </button>
        </div>

        <section className="profile-guest__links">
          <button
            className="profile-link-item"
            onClick={() => state.showToast("Help center opened in prototype mode.")}
          >
            <HelpCircle size={20} strokeWidth={1.8} />
            <span>Help & Support</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
          <button
            className="profile-link-item"
            onClick={() => {
              state.setActiveTab("home");
              state.showToast("The Met overview opened.");
            }}
          >
            <Info size={20} strokeWidth={1.8} />
            <span>About The Met</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
          <button
            className="profile-link-item"
            onClick={() => state.showToast("Privacy summary displayed in prototype mode.")}
          >
            <Shield size={20} strokeWidth={1.8} />
            <span>Privacy Policy</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
        </section>

        <footer className="profile-footer">
          <p>Explor v1.0 - The Metropolitan Museum of Art</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="page profile-page profile-logged">
      <header className="profile-header">
        <div className="profile-header__top-row">
          <span className="profile-header__top-label">Profile</span>
          <DarkModeToggle />
        </div>

        <div className="profile-header__avatar">
          <span className="profile-header__initials">{getInitials(PROFILE_SUMMARY.name)}</span>
        </div>
        <h1 className="profile-header__name">{PROFILE_SUMMARY.name}</h1>
        <div className="profile-header__badge">
          <Award size={14} strokeWidth={2} />
          <span>{PROFILE_SUMMARY.membershipType}</span>
        </div>
        <p className="profile-header__since">Member since {PROFILE_SUMMARY.memberSince}</p>
      </header>

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
          <span className="profile-stat__value">{PROFILE_SUMMARY.totalTimeSpent}</span>
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
                    <p className="profile-favorite-card__title">{artwork.title}</p>
                    <p className="profile-favorite-card__artist">{artwork.artist}</p>
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

      <section className="profile-saved-routes section">
        <div className="section-header">
          <h2>Saved Routes</h2>
        </div>
        {state.savedRoutes.length === 0 ? (
          <div className="profile-saved-routes__empty">
            <Route size={28} strokeWidth={1.5} />
            <p>Generate and save your first personalized route from the Map tab.</p>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => state.setActiveTab("map")}
            >
              <Compass size={16} strokeWidth={2} />
              Open Map
            </button>
          </div>
        ) : (
          <div className="profile-saved-routes__list">
            {state.savedRoutes.map((route) => (
              <article key={route.id} className="profile-route-card">
                <div className="profile-route-card__meta">
                  <h3>{route.name}</h3>
                  <p>{route.description}</p>
                </div>
                <div className="profile-route-card__pills">
                  <span>{route.duration}</span>
                  <span>{route.stops} stops</span>
                </div>
                <div className="profile-route-card__actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => state.setSelectedRoute(route)}
                  >
                    <Eye size={14} strokeWidth={2} />
                    Open
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      state.clearSavedRoute(route.id);
                      state.showToast("Route removed from your profile");
                    }}
                  >
                    <Trash2 size={14} strokeWidth={2} />
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="profile-preferences section">
        <div className="section-header">
          <h2>Your Art Interests</h2>
        </div>
        <p className="profile-preferences__desc">
          Selected interests shape your recommendations and generated map routes.
        </p>
        <div className="profile-preferences__chips">
          {interestOptions.map((interest) => (
            <button
              key={interest}
              className={`profile-pref-chip${state.preferences.includes(interest) ? " active" : ""}`}
              onClick={() => state.togglePreference(interest)}
            >
              {state.preferences.includes(interest) && <Star size={13} strokeWidth={2.2} />}
              {interest}
            </button>
          ))}
          {interestOptions.length === 0 && (
            <p style={{ color: "var(--color-text-secondary)" }}>
              Department interests are loading from The Met API.
            </p>
          )}
        </div>
      </section>

      <section className="profile-account section">
        <div className="section-header">
          <h2>Account</h2>
        </div>
        <div className="profile-account__menu">
          <button
            className="profile-menu-item"
            onClick={() => state.showToast("Profile details panel opened (prototype).")}
          >
            <span className="profile-menu-item__icon-wrap">
              <User size={18} strokeWidth={1.8} />
            </span>
            <span>Edit Profile</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
          <button
            className="profile-menu-item"
            onClick={() => state.showToast("Notification preferences updated (prototype).")}
          >
            <span className="profile-menu-item__icon-wrap">
              <Bell size={18} strokeWidth={1.8} />
            </span>
            <span>Notifications</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
          <button
            className="profile-menu-item"
            onClick={() => state.showToast("Visit history preview opened (prototype).")}
          >
            <span className="profile-menu-item__icon-wrap">
              <Clock size={18} strokeWidth={1.8} />
            </span>
            <span>Visit History</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
          <button
            className="profile-menu-item"
            onClick={() => state.showToast("Help center opened in prototype mode.")}
          >
            <span className="profile-menu-item__icon-wrap">
              <HelpCircle size={18} strokeWidth={1.8} />
            </span>
            <span>Help & Support</span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
          <button
            className="profile-menu-item profile-menu-item--signout"
            onClick={() => {
              state.logout();
              state.showToast("Signed out");
            }}
          >
            <span className="profile-menu-item__icon-wrap profile-menu-item__icon-wrap--signout">
              <LogOut size={18} strokeWidth={1.8} />
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      <footer className="profile-footer">
        <p>Explor v1.0 - The Metropolitan Museum of Art</p>
      </footer>
    </div>
  );
}
