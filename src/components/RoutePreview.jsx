import React from "react";
import { X, Clock, MapPin, Navigation } from "lucide-react";
import "./RoutePreview.css";

const MOCKED_STOPS = [
  { name: "Start: Great Hall Entrance", detail: "Meeting point" },
  { name: "Gallery 822 — Van Gogh", detail: "~15 min" },
  { name: "Gallery 815 — Degas & the Dance", detail: "~20 min" },
  { name: "Gallery 956 — Egyptian Wing", detail: "~20 min" },
  { name: "Gallery 774 — Arms & Armor", detail: "~15 min" },
  { name: "End: Museum Shop", detail: "Final stop" },
];

export default function RoutePreview({ route, onClose }) {
  if (!route) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="route-overlay" onClick={handleBackdropClick}>
      <div className="route-overlay__backdrop" />

      <div className="route-panel">
        {/* ===== HANDLE + CLOSE ===== */}
        <div className="route-panel__header">
          <div className="route-panel__drag-handle" />
          <button
            className="route-panel__close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* ===== SCROLLABLE CONTENT ===== */}
        <div className="route-panel__body">
          {/* --- Header --- */}
          <div className="route-panel__intro">
            <span className="route-panel__overline">Your Curated Path</span>
            <h2 className="route-panel__title">{route.name}</h2>
            <p className="route-panel__description">{route.description}</p>
          </div>

          {/* --- Stats pills --- */}
          <div className="route-panel__stats">
            <div className="route-panel__stat-pill">
              <Clock size={14} strokeWidth={2} />
              <span>{route.duration}</span>
            </div>
            <div className="route-panel__stat-pill">
              <MapPin size={14} strokeWidth={2} />
              <span>{route.stops} stops</span>
            </div>
            <div className="route-panel__stat-pill">
              <Navigation size={14} strokeWidth={2} />
              <span>{route.zones.length} wings</span>
            </div>
          </div>

          <div className="route-panel__divider" />

          {/* --- Route Timeline --- */}
          <div className="route-panel__timeline-section">
            <h3 className="route-panel__timeline-heading">Route Overview</h3>

            <div className="route-panel__timeline">
              {MOCKED_STOPS.map((stop, index) => (
                <div
                  className="route-panel__timeline-stop"
                  key={index}
                  style={{ animationDelay: `${0.3 + index * 0.06}s` }}
                >
                  <div className="route-panel__timeline-marker">
                    <div className="route-panel__timeline-circle">
                      {index + 1}
                    </div>
                    {index < MOCKED_STOPS.length - 1 && (
                      <div className="route-panel__timeline-line" />
                    )}
                  </div>

                  <div className="route-panel__timeline-content">
                    <span className="route-panel__stop-name">{stop.name}</span>
                    <span className="route-panel__stop-detail">
                      {stop.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== STICKY FOOTER ===== */}
        <div className="route-panel__footer">
          <button className="route-panel__start-btn">
            <span>Start Route</span>
          </button>
          <p className="route-panel__footer-note">
            Route is optimized for minimal walking distance
          </p>
        </div>
      </div>
    </div>
  );
}
