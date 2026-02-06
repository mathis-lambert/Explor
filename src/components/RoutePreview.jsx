import React from "react";
import { X, Clock, MapPin, Navigation, Bookmark } from "lucide-react";
import "./RoutePreview.css";

function buildFallbackTimeline(route) {
  const zones = Array.isArray(route.zones) ? route.zones : [];

  return [
    { name: "Start: Great Hall Entrance", detail: "Meeting point" },
    ...zones.map((zoneName, index) => ({
      name: `${zoneName} Gallery ${index + 1}`,
      detail: `~${12 + index * 4} min`,
    })),
    { name: "End: Museum Store", detail: "Final stop" },
  ];
}

export default function RoutePreview({
  route,
  onClose,
  onStartRoute,
  onSaveRoute,
  isSaved,
}) {
  if (!route) return null;

  const timeline =
    Array.isArray(route.timeline) && route.timeline.length > 0
      ? route.timeline
      : buildFallbackTimeline(route);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="route-overlay" onClick={handleBackdropClick}>
      <div className="route-overlay__backdrop" />

      <div className="route-panel">
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

        <div className="route-panel__body">
          <div className="route-panel__intro">
            <span className="route-panel__overline">Your Curated Path</span>
            <h2 className="route-panel__title">{route.name}</h2>
            <p className="route-panel__description">{route.description}</p>
          </div>

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

          <div className="route-panel__timeline-section">
            <h3 className="route-panel__timeline-heading">Route Overview</h3>

            <div className="route-panel__timeline">
              {timeline.map((stop, index) => (
                <div
                  className="route-panel__timeline-stop"
                  key={`${stop.name}-${index}`}
                  style={{ animationDelay: `${0.3 + index * 0.06}s` }}
                >
                  <div className="route-panel__timeline-marker">
                    <div className="route-panel__timeline-circle">{index + 1}</div>
                    {index < timeline.length - 1 && (
                      <div className="route-panel__timeline-line" />
                    )}
                  </div>

                  <div className="route-panel__timeline-content">
                    <span className="route-panel__stop-name">{stop.name}</span>
                    <span className="route-panel__stop-detail">{stop.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="route-panel__footer">
          <div className="route-panel__footer-actions">
            <button className="route-panel__save-btn" onClick={onSaveRoute}>
              <Bookmark size={16} strokeWidth={2} />
              <span>{isSaved ? "Saved" : "Save Route"}</span>
            </button>
            <button className="route-panel__start-btn" onClick={onStartRoute}>
              <span>Start Route</span>
            </button>
          </div>
          <p className="route-panel__footer-note">
            Route is optimized for minimal walking distance
          </p>
        </div>
      </div>
    </div>
  );
}
