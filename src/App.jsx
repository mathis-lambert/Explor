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
          onFindInMuseum={(artwork) => {
            state.setMapFocusDepartmentName(artwork.department || "");
            state.setActiveTab("map");
            state.setSelectedArtwork(null);
            state.showToast(
              artwork.department
                ? `Locating ${artwork.department} on the museum map`
                : "Opening museum map",
            );
          }}
        />
      )}

      {state.showTicketCheckout && (
        <TicketCheckout
          session={state.showTicketCheckout}
          onClose={() => state.setShowTicketCheckout(null)}
          onComplete={(result) => {
            state.setShowTicketCheckout(null);
            state.showToast(
              `Ticket confirmed${result?.confirmationCode ? ` • ${result.confirmationCode}` : ""}`,
            );
          }}
        />
      )}

      {state.selectedRoute && (
        <RoutePreview
          route={state.selectedRoute}
          onClose={() => state.setSelectedRoute(null)}
          onSaveRoute={() => {
            state.saveRoute(state.selectedRoute);
            state.showToast("Route saved to your profile");
          }}
          isSaved={state.savedRoutes.some((route) => route.id === state.selectedRoute.id)}
          onStartRoute={() => {
            state.setSelectedRoute(null);
            state.showToast("Route guidance started (prototype)");
          }}
        />
      )}

      {state.toast && (
        <div className="toast" role="status" aria-live="polite" aria-atomic="true">
          {state.toast}
        </div>
      )}
    </div>
  );
}
