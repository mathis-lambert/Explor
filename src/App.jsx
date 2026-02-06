import React from "react";
import { useAppState } from "./hooks/useAppState";
import BottomNav from "./components/BottomNav";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import MapPage from "./pages/MapPage";
import TicketsPage from "./pages/TicketsPage";
import ProfilePage from "./pages/ProfilePage";
import ArtworkDetail from "./components/ArtworkDetail";
import TicketCheckout from "./components/TicketCheckout";
import RoutePreview from "./components/RoutePreview";

export default function App() {
  const state = useAppState();

  const renderPage = () => {
    switch (state.activeTab) {
      case "home":
        return <HomePage key="home" state={state} />;
      case "explore":
        return <ExplorePage key="explore" state={state} />;
      case "map":
        return <MapPage key="map" state={state} />;
      case "tickets":
        return <TicketsPage key="tickets" state={state} />;
      case "profile":
        return <ProfilePage key="profile" state={state} />;
      default:
        return <HomePage key="home" state={state} />;
    }
  };

  return (
    <div className="app-container">
      {renderPage()}

      <BottomNav
        activeTab={state.activeTab}
        setActiveTab={state.setActiveTab}
      />

      {state.selectedArtwork && (
        <ArtworkDetail
          artwork={state.selectedArtwork}
          onClose={() => state.setSelectedArtwork(null)}
          isFavorited={state.favorites.includes(state.selectedArtwork.id)}
          onToggleFavorite={() => {
            if (!state.isLoggedIn) {
              state.showToast("Sign in to save favorites");
              return;
            }
            state.toggleFavorite(state.selectedArtwork.id);
            state.showToast(
              state.favorites.includes(state.selectedArtwork.id)
                ? "Removed from favorites"
                : "Added to favorites",
            );
          }}
        />
      )}

      {state.showTicketCheckout && (
        <TicketCheckout
          ticket={state.showTicketCheckout}
          onClose={() => state.setShowTicketCheckout(null)}
          onConfirm={() => {
            state.setShowTicketCheckout(null);
            state.showToast("Ticket purchased successfully!");
          }}
        />
      )}

      {state.selectedRoute && (
        <RoutePreview
          route={state.selectedRoute}
          onClose={() => state.setSelectedRoute(null)}
        />
      )}

      {state.toast && <div className="toast">{state.toast}</div>}
    </div>
  );
}
