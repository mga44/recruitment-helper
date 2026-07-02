# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Recruitment Helper — a single-user job-application tracker. React 19 + Vite frontend, Express 5 + Mongoose backend, MongoDB storage, with Google Calendar integration for interview appointments.

## Commands

```bash
# Full stack via Docker (app served at http://localhost:8080)
docker compose up --build

# Frontend dev server (Vite, http://localhost:5173; /api proxied to localhost:5000)
cd frontend && npm run dev

# Frontend lint / production build
cd frontend && npm run lint
cd frontend && npm run build

# Demo-mode build (localStorage instead of backend; used for GitHub Pages)
cd frontend && VITE_DEMO_MODE=true npm run build

# Backend (requires MongoDB running; MONGO_URI defaults to mongodb://localhost:27017/recruitment)
cd backend && npm start

# Backend tests (jest + supertest + in-memory Mongo; no DB needed)
cd backend && npm test
cd backend && npx jest tests/processes.test.js   # single suite

# Seed sample data into Mongo (refuses to wipe a non-empty DB without --force)
cd backend && npm run seed
```

The backend has no hot reload. Frontend tests don't exist; backend route tests live in `backend/tests/`.

## Architecture

Two independent npm projects (`frontend/`, `backend/`) plus a `docker-compose.yml` that wires up three containers: `mongodb`, `backend` (port 5000, not exposed to host), and `frontend` (nginx on host port 8080).

**API routing/proxying:** the frontend calls relative `/api/...` URLs (see `frontend/src/api.js`, the single fetch-wrapper module all components use). In Docker, `frontend/nginx.conf` proxies `/api` to `backend:5000`; in dev, `vite.config.js` proxies `/api` to `http://localhost:5000`. The OAuth callback redirects to `FRONTEND_URL` (defaults to `http://localhost:5173`) in `authRoutes.js`.

**Demo mode:** `frontend/src/api/index.js` switches at build time between `real.js` (fetch client) and `demo.js` (localStorage-backed, same response shapes) based on `VITE_DEMO_MODE`. The seed dataset `frontend/src/api/seed-data.json` stores dates as day offsets (materialized at seed time) and is shared with `backend/scripts/seed.js`.

**Backend structure:** `app.js` builds the Express app (used directly by supertest in tests); `server.js` adds the Mongo connection and listener. One router per domain under `/api/*`:
- `/api/processes` (`routes/processRoutes.js`) — CRUD on recruitment processes
- `/api/problems` (`routes/problemRoutes.js`) — LeetCode problem log, incl. `/daily-stats`
- `/api/tasks` (`routes/taskRoutes.js`) — todos, optionally referencing a Process
- `/api/auth` (`routes/authRoutes.js`) — Google OAuth flow

**Data model (Mongoose, `backend/models/`):** `Process` is the central document — job application with status enum (`Applied`/`Screened`/`Technical`/`Managerial`/`Offer`/`Rejected`/`Ghosted`), salary range, rejection feedback, and *embedded* arrays of notes and appointments. `Task` references `Process` by ObjectId; `Problem` is standalone. When adding a Process status, also update the `statuses` list and priority-sorting logic duplicated in `frontend/src/App.jsx`.

**Google Calendar integration:** `backend/utils/googleCalendarService.js` wraps a single OAuth2 client. Tokens are persisted to `backend/tokens.json` (file-based, single user — no user accounts exist; gitignored). `POST /api/processes/:id/appointments` first creates the Calendar event, then embeds the appointment (with the returned `eventId`) into the Process document. Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` in `backend/.env` (see `backend/.env.template`).

**Frontend structure:** no router and no state library. `App.jsx` owns all processes state and CRUD handlers, passing them down to components in `src/components/`. `LeetCodeTracker` and `TaskTracker` fetch their own data independently. Forms (`ProcessForm`, `AppointmentForm`) are modal overlays toggled by App state.
