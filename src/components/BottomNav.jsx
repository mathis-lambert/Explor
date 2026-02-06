import React from "react";
import { Home, Compass, MapPin, Ticket, User } from "lucide-react";
import "./BottomNav.css";

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "explore", label: "Explor", icon: Compass },
  { id: "map", label: "Map", icon: MapPin },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "profile", label: "Profile", icon: User },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {tabs.map(({ id, label, icon }) => {
          const Icon = icon;
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              className={`nav-tab ${isActive ? "nav-tab-active" : ""}`}
              onClick={() => setActiveTab(id)}
              aria-label={label}
            >
              <div className="nav-tab-content">
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                {isActive && <span className="nav-tab-label">{label}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
