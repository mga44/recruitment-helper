# Ops Console redesign — design spec

Date: 2026-07-05

## Overview

Full visual redesign of the main dashboard and its supporting modals, moving from the current dark glassmorphism look (blurred cards, colorful pill badges, gradient text) to a minimal, monospace-leaning "CLI" aesthetic: flat backgrounds, hairline dividers, plain-text controls, semantic color used only on text (never as filled badges/boxes).

Source reference: `Ops Console v2.dc.html` and `README.md` in `C:\Users\marku\Downloads\Design improvement options\design_handoff_ops_console` (a static HTML/JS prototype with mock data — a design reference, not code to copy directly). That handoff covers the dashboard only; this spec extends the same treatment to the modals and preserves two form fields the handoff's mockup omits, and adds a responsive fallback the handoff doesn't address. Those three extensions were explicit decisions made with the user during brainstorming (see "Extensions beyond the handoff" below).

This is a pure visual-layer change. No state, handler, data flow, routing, or API behavior changes anywhere.

## Design tokens (`frontend/src/index.css`)

Replace the `:root` block:

```css
--bg-dark: #0B0C0E;
--bg-card: transparent;      /* no more card fills — flat page bg + hairline dividers */
--text-main: #F2F3F5;
--text-body: #DCE0E5;        /* body copy, slightly dimmer than headings */
--text-muted: #5B6472;
--text-faint: #4A5058;       /* timestamps, secondary meta */
--border: #1C1F23;           /* hairline dividers, not card borders */
--border-strong: #23262B;    /* input underlines, table header rule */
--accent: #3DDC97;           /* single accent — links, primary CTA, offers, positive values */
--warning: #FFB020;          /* interview-stage statuses, due-soon tasks */
--error: #FF5C5C;            /* rejected/ghosted, overdue, delete actions */
--neutral-status: #8B92A0;   /* "Applied" status */
```

Drop `--primary`, `--primary-hover`, `--success`, and the old `--accent` (magenta, `#c026d3`) entirely. The new `--accent` token above (green, `#3DDC97`) replaces the old accent's name but not its role — combined with the other semantic tokens, it covers every prior use.

## Typography

- Body copy, company names, task/problem titles: **IBM Plex Sans** (400/500/600/700), base 15px, line-height 1.6.
- All labels, data values, statuses, dates, salary, and monospace UI chrome: **IBM Plex Mono** (400/500/600/700).
- Google Fonts import: `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap`.
- Drop `Inter` and `Outfit` entirely.

## Shape and depth

Zero border-radius, zero box-shadow, zero backdrop-filter anywhere in the app (dashboard **and** modals). All separation is a 1px hairline border (`--border`) or whitespace. The `.glass` class's blur/border/radius treatment is removed (repurposed to a plain flat background, or deleted and its usages dropped).

## Global elements (`frontend/src/App.css`)

- `.btn-primary` / `.btn-secondary`: become plain text links / underline-style controls rather than filled pill buttons. Primary actions render bold in `--accent` (e.g. `[ + new_application ]`); secondary actions render muted.
- `input`, `select`, `textarea`: underline-only — `border-bottom: 1px solid var(--border-strong)`, transparent background, no border-radius, no filled background.
- `.badge`: removed. Status values render as plain colored text using the existing `statusColor()` mapping (`Applied` → `--neutral-status`, `Screened`/`Technical`/`Managerial` → `--warning`, `Offer` → `--accent`, `Rejected`/`Ghosted` → `--error`) — no pill background or border, anywhere the status appears.
- `body` background: flat `--bg-dark`, no radial-gradient decoration.

## Screens

### 1. Prompt line (new)

Static decorative element above the header in `App.jsx`: `$ recruitment-helper --dashboard` in IBM Plex Mono 13px `--text-muted`, `$` in `--accent`, plus a blinking 7×14px block cursor (`@keyframes blink`, step-end, 1s).

### 2. Header (`App.jsx`)

- Title "Recruitment Helper" — IBM Plex Sans 700, 26px, `--text-main`. No colored "Helper" span.
- Tagline below, 14px `--text-muted`.
- Right side: plain mono text links, 13px, 20px gaps: `connect_calendar` (muted) or `calendar: connected` (accent, when connected) · `feedback_summary` · `[ + new_application ]` (bold accent — the one visual CTA). Replaces the current button/pill treatment.
- 1px `--border` rule under the whole header block.

### 3. Demo banner

Only rendered when `isDemoMode` (unchanged condition). One line, mono 12.5px `--text-faint`: `# demo_mode — data stored locally, calendar simulated`, with a `reset` text link at the right. No box/border.

### 4. Stats (`Dashboard.jsx`)

Collapses the 4 stat cards into one inline mono line, 15px: `{total} total / {active} active / {interviewing} interviewing / {offers} offers` — numbers bold `--text-main` except interviewing (`--warning`) and offers (`--accent`); `/` separators in a dim tone (`#2E333A`). Deletes the stat-card grid/gradient-text CSS.

### 5. LeetCode + Tasks (`LeetCodeTracker.jsx`/`.css`, `TaskTracker.jsx`/`.css`)

Two columns side-by-side (`grid-template-columns: 1fr 1fr`, gap 48px) — not stacked, not boxed panels (no background, no border, no blur).

- Section header: lowercase `# leetcode` / `# tasks` mono label, 12.5px muted; click to collapse (`▲`/`▼` mono icon, right-aligned). Collapse/expand animates via height/opacity transition (replacing today's `max-height` trick / instant conditional render).
- **LeetCode progress**: literal block-character bar built in JS — `'█'.repeat(dailyCount) + '░'.repeat(goal - dailyCount)` — 16px, letter-spacing 2px, accent green. Replaces the SVG ring.
- **LeetCode form**: title input, URL input (**kept** — extension, see below), difficulty select, `↵ log` accent text link. All underline-style inputs.
- **Recent problems rows**: plain flex row, 1px `--border`-colored top rule (not a filled card), 10px vertical padding, difficulty as colored mono text, `↗` link instead of "View".
- **Tasks form**: description input, related-process select (**kept** — extension, see below), date input, `↵ add` accent text link.
- **Task rows**: `[x]` / `[ ]` literal mono marker (clickable, toggles done — replaces the checkbox), hairline top rule, related-process name in muted mono (replaces the 🏢 emoji), due label in warning/error mono. Done tasks: 50% opacity + strikethrough.

### 6. Processes (`ProcessCard.jsx`, filter/toggle row in `App.jsx`)

- Section label: `# processes ({count})` mono muted, replacing `<h2>Processes</h2>`.
- Filter/sort: native `<select>`s styled underline-only mono text (no box).
- View toggle: plain text `list / grid` — active bold + accent, inactive muted (replaces the icon-button segmented control). Same `viewMode` state.
- **List view** (default unchanged): dense table, numbered rows (`01`, `02`, ...), mono for status/salary/date/actions, Plex Sans for company/role. Status is plain colored text, no pill. Row separators are 1px hairlines, no card background. `edit`/`del` become plain text links.
- **Grid view**: cards separated by a 1px hairline grid (`gap:1px` on a `--border`-colored container, each cell flat `--bg-dark`) rather than individually-bordered rounded cards with hover-lift. Rejection feedback shown as a left-rule quote (`border-left: 2px solid --error`), not a filled red box. Footer actions (`edit` / `del` / `+ appt`) become plain text links, `+ appt` right-aligned.
- Empty state and loading state: plain muted mono text, no `.glass` box.

### 7. Modals — extension beyond the handoff

`ProcessForm`, `AppointmentForm`, and the Feedback Summary popup (all currently `.modal-overlay` / `.modal-content.glass`) get the same flat treatment for visual consistency with the rest of the app:

- Panel: flat `--bg-dark` background, 1px `--border` outline, no blur/radius/shadow.
- Field labels: mono, `--text-muted`.
- Inputs/selects/textareas: reuse the global underline-only style.
- Actions: Cancel/Submit become text-link-style controls (Cancel muted, Submit bold accent) instead of filled buttons.
- No structural, field, or validation changes — purely re-skinned.

### 8. Responsive fallback — extension beyond the handoff

The mockup is desktop-only (fixed max-width, no breakpoints). This app keeps a light responsive fallback matching today's behavior:

- Below ~1024px, the leetcode/tasks two-column grid stacks to a single column.
- List-view table columns compress (smaller font, tighter gaps) rather than overflowing, re-tuned to the new column set (index/company-role/status/salary/date/link/actions).

## Extensions beyond the handoff (explicit decisions)

These three points were confirmed with the user during brainstorming, since the handoff doc only specifies the dashboard at desktop fidelity:

1. **Modals are in scope** — restyled to match, not left in the old glass style.
2. **No functionality is dropped** — the task "related process" dropdown and the LeetCode "URL" input, both present in today's app but absent from the mockup's simplified quick-add rows, are kept and styled as additional underline-only inputs/selects.
3. **A responsive fallback is added** — the mockup has none; this app keeps roughly the responsive behavior it has today, re-styled to the new look.

## Implementation approach

Follow the codebase's existing convention: translate the mockup's inline styles into CSS classes in the relevant `.css` files (`index.css`, `App.css`, `LeetCodeTracker.css`, `TaskTracker.css`), matching how `ProcessCard.jsx` etc. already work today. Inline styles are reserved for genuinely dynamic per-item values (e.g. a status's color), same as the current code. No new dependencies (no styled-components, no CSS-in-JS).

## Files touched

`frontend/src/index.css`, `frontend/src/App.css`, `frontend/src/App.jsx`, `frontend/src/components/Dashboard.jsx`, `ProcessCard.jsx`, `LeetCodeTracker.jsx` + `.css`, `TaskTracker.jsx` + `.css`, `ProcessForm.jsx`, `AppointmentForm.jsx`.

## Out of scope

- Any change to state, event handlers, data fetching, routing, or the API layer.
- Any change to the `statuses` list or status priority-sorting logic (both already shared between `App.jsx` and the mockup's mock logic, and remain unchanged).
- Any change to backend, Mongoose models, or Google Calendar integration.
