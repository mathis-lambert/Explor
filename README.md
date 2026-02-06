# Explor (The Met) - Premium Mobile-First Prototype

Explor is a mobile-first React app concept for The Metropolitan Museum of Art.
It is built as a premium UI/UX prototype with live MET collection data for artworks and departments.

## Product Scope and Constraints

- Navigation is fixed to 5 tabs: `Home`, `Explor`, `Map`, `Tickets`, `Profile`.
- The tab label must remain `Explor` (brand and navigation consistency).
- This project is UI/UX-first and prototype-oriented.
- Artworks and departments are loaded from The Met Collection API.
- Non-collection flows are simulated locally (no real auth, no real payment, no backend business logic).
- Guest mode can browse and purchase simulated tickets.
- Logged-in mode is a UI state toggle that unlocks favorites, preferences, and route generation simulation.

## Live vs Mocked Behavior

Live data source:
- `/src/api/metApi.js` fetches departments and artworks from The Met API.

Mocked/simulated flows:
- Ticket purchase outcomes (success, declined, unavailable).
- Route generation latency and error simulation.
- Profile login/logout is local UI state.
- Recommendations and saved routes are local prototype logic.

## State, Persistence, and UX Status

- Global app state is managed in `/src/hooks/useAppState.js`.
Persisted local state (localStorage):
- `isLoggedIn`, `favorites`, `preferences`, `savedRoutes`, `recentlyViewed`, `exploreControls`.
Screen status model:
- `idle | loading | success | empty | error` via `uiStatusByScreen`.
Persistence utilities:
- `/src/utils/localState.js`.
Simulation helpers:
- `/src/mocks/uiSimulation.js`, `/src/mocks/routeBuilder.js`.

## Accessibility and UX Quality Baseline

- Mobile zoom is enabled (`index.html` viewport does not lock scaling).
- Global visible focus states use `:focus-visible`.
- Reduced motion is respected via `prefers-reduced-motion`.
- Toast messages are announced through an accessible live region (`role="status"`, `aria-live="polite"`).

## Tech Stack

- React 19
- Vite 7
- ESLint 9
- Lucide React icons
- Node.js 24 for containerized runtime/build

## Local Development

Prerequisites:
- Node.js 24+
- npm

Install and run:

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run build
```

## MET API Configuration

- Dev mode uses a Vite proxy route: `/met-api`.
- Production defaults to direct MET API URL unless overridden.
Base URL behavior in `/src/api/metApi.js`:
- `VITE_MET_API_BASE_URL` if provided
- `/met-api` in dev
- `https://collectionapi.metmuseum.org/public/collection/v1` in production fallback

## Docker Deployment (Node 24 + Traefik)

Files:
- `Dockerfile` (multi-stage build, Node 24 Alpine, serves built app on port `4173`)
- `docker-compose.yml` (Traefik labels and routing)
- `.env.example` (deployment env template)

Prepare env:

```bash
cp .env.example .env
```

Set values in `.env`:
- `EXPLOR_DOMAIN`
- `TRAEFIK_CERTRESOLVER`

Deploy:

```bash
docker compose up -d --build
```

Current Traefik/network assumptions in `docker-compose.yml`:
- External Docker network named `proxy` exists
- Traefik routes `Host(EXPLOR_DOMAIN)` to service `explor-web`
- TLS is enabled on `websecure` entrypoint

## Repository Structure (Main)

- `src/App.jsx`: app shell, tab routing, overlays.
- `src/pages/`: Home, Explore, Map, Tickets, Profile screens.
- `src/components/`: detail sheets, nav, checkout, route preview, sort sheet.
- `src/api/metApi.js`: MET API wrapper and normalization.
- `src/hooks/useAppState.js`: global state and persistence orchestration.
- `src/mocks/`: simulated flows for prototype interactions.
- `src/utils/localState.js`: local persistence helpers.

## Notes

- This app intentionally prioritizes design quality and flow realism over backend completeness.
- If you need fully functional authentication, payment, or server-side personalization, add dedicated backend services and API contracts.
