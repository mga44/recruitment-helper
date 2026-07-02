# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Recruitment Helper — a single-user job-application tracker. React 19 + Vite frontend, Express 5 + Mongoose backend, MongoDB storage, with Google Calendar integration for interview appointments. There are no tests anywhere in the repo.

## Commands

```bash
# Full stack via Docker (app served at http://localhost:8080)
docker compose up --build

# Frontend dev server (Vite, http://localhost:5173)
cd frontend && npm run dev

# Frontend lint / production build
cd frontend && npm run lint
cd frontend && npm run build

# Backend (requires MongoDB running; MONGO_URI defaults to mongodb://localhost:27017/recruitment)
cd backend && node server.js
```

The backend has no dev/start script in package.json and no hot reload — run `node server.js` directly.

## Architecture

Two independent npm projects (`frontend/`, `backend/`) plus a `docker-compose.yml` that wires up three containers: `mongodb`, `backend` (port 5000, not exposed to host), and `frontend` (nginx on host port 8080).

**API routing/proxying:** the frontend calls relative `/api/...` URLs (see `frontend/src/api.js`, the single fetch-wrapper module all components use). In Docker, `frontend/nginx.conf` proxies `/api` to `backend:5000`. **`vite.config.js` has no dev proxy configured**, so under `npm run dev` API calls only work if you add a proxy or run the dockerized stack. Exceptions to relative URLs: the Google OAuth flow hardcodes `http://localhost:5000/api/auth/google` (App.jsx) and the OAuth callback redirects to `http://localhost:5173` (authRoutes.js) — i.e., the OAuth flow assumes the dev ports.

**Backend structure:** `server.js` mounts one Express router per domain under `/api/*`:
- `/api/processes` (`routes/processRoutes.js`) — CRUD on recruitment processes
- `/api/problems` (`routes/problemRoutes.js`) — LeetCode problem log, incl. `/daily-stats`
- `/api/tasks` (`routes/taskRoutes.js`) — todos, optionally referencing a Process
- `/api/auth` (`routes/authRoutes.js`) — Google OAuth flow

**Data model (Mongoose, `backend/models/`):** `Process` is the central document — job application with status enum (`Applied`/`Screened`/`Technical`/`Managerial`/`Offer`/`Rejected`/`Ghosted`), salary range, rejection feedback, and *embedded* arrays of notes and appointments. `Task` references `Process` by ObjectId; `Problem` is standalone. When adding a Process status, also update the `statuses` list and priority-sorting logic duplicated in `frontend/src/App.jsx`.

**Google Calendar integration:** `backend/utils/googleCalendarService.js` wraps a single OAuth2 client. Tokens are persisted to `backend/tokens.json` (file-based, single user — no user accounts exist). `POST /api/processes/:id/appointments` first creates the Calendar event, then embeds the appointment (with the returned `eventId`) into the Process document. Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` in `backend/.env`. Note: `backend/.env.template` is outdated — it lists service-account variables the code no longer uses.

**Frontend structure:** no router and no state library. `App.jsx` owns all processes state and CRUD handlers, passing them down to components in `src/components/`. `LeetCodeTracker` and `TaskTracker` fetch their own data independently. Forms (`ProcessForm`, `AppointmentForm`) are modal overlays toggled by App state.
