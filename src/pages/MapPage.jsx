import React, { useEffect, useMemo, useState } from "react";
import {
  Map,
  Layers,
  Info,
  Eye,
  Navigation,
  Route,
  Clock,
  MapPin,
  Sparkles,
  Lock,
  ChevronRight,
  Compass,
  Star,
} from "lucide-react";
import { fetchDepartments } from "../api/metApi";
import "./MapPage.css";

const popularRoutes = [
  {
    id: "highlights",
    name: "Highlights Tour",
    duration: "1.5h",
    stops: 12,
    colors: ["#B8934E", "#7A2B3A"],
    description: "The essential Met experience",
    icon: Star,
  },
  {
    id: "ancient",
    name: "Ancient Worlds",
    duration: "2h",
    stops: 10,
    colors: ["#D4943A", "#8B6D4B"],
    description: "Egypt, Greece, Rome & beyond",
    icon: Compass,
  },
  {
    id: "modern",
    name: "Modern Masters",
    duration: "1h",
    stops: 8,
    colors: ["#3A5B8B", "#5B7B6F"],
    description: "Pollock, Warhol & more",
    icon: Sparkles,
  },
];

/* Layout presets for zones on each floor — purely decorative positioning */
const zoneLayouts = {
  1: [
    { gridColumn: "1 / 3", gridRow: "1 / 2" },
    { gridColumn: "3 / 5", gridRow: "1 / 2" },
    { gridColumn: "1 / 3", gridRow: "2 / 3" },
    { gridColumn: "3 / 5", gridRow: "2 / 3" },
  ],
  2: [
    { gridColumn: "1 / 4", gridRow: "1 / 2" },
    { gridColumn: "4 / 5", gridRow: "1 / 3" },
    { gridColumn: "1 / 2", gridRow: "2 / 3" },
    { gridColumn: "2 / 4", gridRow: "2 / 3" },
  ],
};

const floorLabels = {
  1: [
    { text: "Entrance", top: "6%", left: "50%" },
    { text: "Great Hall", top: "48%", left: "50%" },
    { text: "Gift Shop", top: "92%", left: "16%" },
  ],
  2: [
    { text: "Balcony", top: "6%", left: "50%" },
    { text: "Skylight Court", top: "48%", left: "50%" },
    { text: "Rooftop Access", top: "92%", left: "80%" },
  ],
};

const ZONE_COLORS = [
  "#B8934E",
  "#7A2B3A",
  "#3A5B8B",
  "#5B7B6F",
  "#9C5A2C",
  "#2E6F64",
  "#6A4D8A",
  "#4B5B7E",
];

function buildZonesFromDepartments(departments) {
  return departments.slice(0, 8).map((department, index) => ({
    id: department.departmentId,
    departmentId: department.departmentId,
    name: department.displayName,
    floor: index < 4 ? 1 : 2,
    color: ZONE_COLORS[index % ZONE_COLORS.length],
    galleries: 3 + (index % 4),
  }));
}

export default function MapPage({ state }) {
  const [activeFloor, setActiveFloor] = useState(1);
  const [selectedZone, setSelectedZone] = useState(null);
  const [mapZones, setMapZones] = useState([]);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  const [zonesError, setZonesError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadZones = async () => {
      setIsLoadingZones(true);
      setZonesError("");

      try {
        const departments = await fetchDepartments(controller.signal);
        setMapZones(buildZonesFromDepartments(departments));
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setMapZones([]);
          setZonesError("Unable to load map departments from The Met API.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingZones(false);
        }
      }
    };

    loadZones();

    return () => controller.abort();
  }, []);

  const currentZones = useMemo(
    () => mapZones.filter((zone) => zone.floor === activeFloor),
    [mapZones, activeFloor],
  );

  const handleGenerateRoute = () => {
    const routeZones =
      state.preferences.length > 0
        ? state.preferences.slice(0, 3)
        : mapZones.slice(0, 3).map((zone) => zone.name);

    state.setSelectedRoute({
      name: "Met API Route",
      duration: "2h 15min",
      stops: Math.max(6, routeZones.length * 3),
      zones: routeZones,
      description: "Generated from live Met department data",
    });

    state.showToast("Personalized route generated");
  };

  return (
    <div className="page map-page">
      {/* ===== HEADER ===== */}
      <header className="map-header">
        <div className="map-header__text">
          <span className="map-header__overline">The Met</span>
          <h1 className="map-header__title">Museum Map</h1>
          <p className="map-header__subtitle">Navigate The Met's galleries</p>
        </div>
        <button
          className="map-header__icon-btn"
          onClick={() => state.showToast("Layers view coming soon")}
          aria-label="Map layers"
        >
          <Layers size={20} strokeWidth={1.8} />
        </button>
      </header>

      {/* ===== FLOOR SELECTOR ===== */}
      <div className="map-floor-selector">
        <div className="map-floor-pills">
          <button
            className={`map-floor-pill ${activeFloor === 1 ? "map-floor-pill--active" : ""}`}
            onClick={() => {
              setActiveFloor(1);
              setSelectedZone(null);
            }}
          >
            <Layers size={14} strokeWidth={2} />
            Floor 1
          </button>
          <button
            className={`map-floor-pill ${activeFloor === 2 ? "map-floor-pill--active" : ""}`}
            onClick={() => {
              setActiveFloor(2);
              setSelectedZone(null);
            }}
          >
            <Layers size={14} strokeWidth={2} />
            Floor 2
          </button>
        </div>
      </div>

      {/* ===== MAP AREA ===== */}
      <section className="map-container-section">
        <div className="map-canvas">
          {floorLabels[activeFloor].map((label) => (
            <span
              key={label.text}
              className="map-canvas__label"
              style={{ top: label.top, left: label.left }}
            >
              {label.text}
            </span>
          ))}

          <div className="map-zones-grid">
            {currentZones.map((zone, index) => {
              const layout = zoneLayouts[activeFloor]?.[index] || {};
              const isSelected = selectedZone?.id === zone.id;

              return (
                <button
                  key={zone.id}
                  className={`map-zone-block ${isSelected ? "map-zone-block--selected" : ""}`}
                  style={{
                    "--zone-color": zone.color,
                    gridColumn: layout.gridColumn,
                    gridRow: layout.gridRow,
                  }}
                  onClick={() => setSelectedZone(isSelected ? null : zone)}
                >
                  <span
                    className="map-zone-block__dot"
                    style={{ background: zone.color }}
                  />
                  <span className="map-zone-block__name">{zone.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== ZONE INFO CARD ===== */}
      <section className="map-zone-info section">
        {isLoadingZones && (
          <div className="map-zone-hint">
            <Info size={16} strokeWidth={2} />
            <span>Loading departments from The Met API...</span>
          </div>
        )}

        {!isLoadingZones && zonesError && (
          <div className="map-zone-hint">
            <Info size={16} strokeWidth={2} />
            <span>{zonesError}</span>
          </div>
        )}

        {!isLoadingZones && !zonesError && selectedZone && (
          <div className="map-zone-card">
            <div className="map-zone-card__header">
              <div
                className="map-zone-card__color-bar"
                style={{ background: selectedZone.color }}
              />
              <div className="map-zone-card__meta">
                <h3 className="map-zone-card__name">{selectedZone.name}</h3>
                <p className="map-zone-card__floor">Floor {selectedZone.floor}</p>
              </div>
            </div>
            <div className="map-zone-card__stats">
              <div className="map-zone-card__stat">
                <div className="map-zone-card__stat-icon">
                  <Map size={14} strokeWidth={2} />
                </div>
                <div className="map-zone-card__stat-text">
                  <span className="map-zone-card__stat-value">
                    {selectedZone.galleries}
                  </span>
                  <span className="map-zone-card__stat-label">galleries</span>
                </div>
              </div>
              <div className="map-zone-card__stat-divider" />
              <div className="map-zone-card__stat">
                <div className="map-zone-card__stat-icon">
                  <Eye size={14} strokeWidth={2} />
                </div>
                <div className="map-zone-card__stat-text">
                  <span className="map-zone-card__stat-value">
                    {selectedZone.departmentId}
                  </span>
                  <span className="map-zone-card__stat-label">department id</span>
                </div>
              </div>
            </div>
            <div className="map-zone-card__actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  state.setActiveTab("explore");
                  state.showToast(`Browsing ${selectedZone.name}`);
                }}
              >
                <Eye size={15} strokeWidth={2} />
                View Artworks
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => state.showToast("Directions feature coming soon")}
              >
                <Navigation size={15} strokeWidth={2} />
                Directions
              </button>
            </div>
          </div>
        )}

        {!isLoadingZones && !zonesError && !selectedZone && (
          <div className="map-zone-hint">
            <Info size={16} strokeWidth={2} />
            <span>Tap a zone on the map to see details</span>
          </div>
        )}
      </section>

      {/* ===== YOUR ROUTE ===== */}
      <section className="map-your-route section">
        <div className="section-header">
          <h2>Your Route</h2>
        </div>
        {state.isLoggedIn ? (
          <div className="map-route-generator">
            <div className="map-route-generator__accent-bar" />
            <div className="map-route-generator__content">
              <div className="map-route-generator__top">
                <div className="map-route-generator__icon-wrap">
                  <Sparkles size={22} strokeWidth={1.8} />
                </div>
                <div className="map-route-generator__text">
                  <h3 className="map-route-generator__title">Personalized Route</h3>
                  <p className="map-route-generator__desc">
                    A curated path based on your interests
                  </p>
                </div>
              </div>
              {state.preferences && state.preferences.length > 0 && (
                <div className="map-route-generator__tags">
                  {state.preferences.map((pref) => (
                    <span key={pref} className="map-route-tag">
                      {pref}
                    </span>
                  ))}
                </div>
              )}
              <button
                className="btn btn-accent btn-sm map-route-generator__btn"
                onClick={handleGenerateRoute}
              >
                <Route size={15} strokeWidth={2} />
                Generate Route
              </button>
            </div>
          </div>
        ) : (
          <div className="map-route-locked">
            <Lock size={18} strokeWidth={1.8} />
            <p className="map-route-locked__text">Sign in to get personalized routes</p>
          </div>
        )}
      </section>

      {/* ===== POPULAR ROUTES ===== */}
      <section className="map-popular-routes">
        <div className="section-header" style={{ padding: "0 var(--space-lg)" }}>
          <h2>Popular Routes</h2>
          <button
            className="section-link"
            onClick={() => state.showToast("All routes coming soon")}
          >
            See All
          </button>
        </div>
        <div className="map-popular-routes__scroll">
          {popularRoutes.map((route) => {
            const RouteIcon = route.icon;
            return (
              <button
                key={route.id}
                className="map-route-card"
                style={{
                  "--route-from": route.colors[0],
                  "--route-to": route.colors[1],
                }}
                onClick={() => state.showToast("Route preview coming soon")}
              >
                <div className="map-route-card__icon-circle">
                  <RouteIcon size={18} strokeWidth={1.8} />
                </div>
                <div className="map-route-card__body">
                  <h3 className="map-route-card__name">{route.name}</h3>
                  <p className="map-route-card__desc">{route.description}</p>
                  <div className="map-route-card__meta">
                    <span className="map-route-card__pill">
                      <Clock size={12} strokeWidth={2.2} />
                      {route.duration}
                    </span>
                    <span className="map-route-card__pill">
                      <MapPin size={12} strokeWidth={2.2} />
                      {route.stops} stops
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  strokeWidth={2}
                  className="map-route-card__arrow"
                />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
