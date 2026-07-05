# Ops Console Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the Recruitment Helper dashboard and its modals from the current dark glassmorphism look to a flat, monospace-leaning "CLI" aesthetic, per `docs/superpowers/specs/2026-07-05-ops-console-redesign-design.md`.

**Architecture:** Pure visual-layer change across the existing React component tree. No new components, no new dependencies, no state/handler/data-flow changes. CSS lives in the same files it lives in today (`index.css`, `App.css`, `LeetCodeTracker.css`, `TaskTracker.css`); JSX changes swap markup/class names, not logic.

**Tech Stack:** React 19 + Vite, plain CSS (no CSS-in-JS, no Tailwind), IBM Plex Mono / IBM Plex Sans via Google Fonts.

## Global Constraints

- Color tokens (replace `frontend/src/index.css` `:root` exactly):
  ```css
  --bg-dark: #0B0C0E;
  --bg-card: transparent;
  --text-main: #F2F3F5;
  --text-body: #DCE0E5;
  --text-muted: #5B6472;
  --text-faint: #4A5058;
  --border: #1C1F23;
  --border-strong: #23262B;
  --accent: #3DDC97;
  --warning: #FFB020;
  --error: #FF5C5C;
  --neutral-status: #8B92A0;
  ```
- Fonts: body/company/task/problem titles use **IBM Plex Sans**; all labels, data values, statuses, dates, salary, and UI chrome use **IBM Plex Mono**. Import: `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap`. Drop `Inter` and `Outfit` entirely.
- Zero `border-radius`, zero `box-shadow`, zero `backdrop-filter` anywhere, including modals. All separation is a 1px hairline border or whitespace.
- No new npm dependencies.
- Follow the codebase's existing convention: CSS classes in `.css` files; inline `style={}` only for genuinely dynamic per-item values (e.g. a status's color), exactly like `ProcessCard.jsx` already does today.
- No frontend automated test suite exists in this repo (per `CLAUDE.md`: "Frontend tests don't exist"). Every task's verification is: `cd frontend && npm run lint` (must exit 0) + `cd frontend && npm run build` (must succeed) + a manual check in a running dev server, per `CLAUDE.md`'s UI-change guidance ("start the dev server and use the feature in a browser before reporting the task as complete").
- For manual checks, run the frontend against demo mode so no backend/MongoDB is required: `cd frontend && VITE_DEMO_MODE=true npm run dev`, then open `http://localhost:5173`. Demo mode uses seeded localStorage data (`frontend/src/api/seed-data.json`) covering every process status, tasks (done/overdue/upcoming), and logged problems — enough to visually verify every state described in this plan.
- Backend, Mongoose models, Google Calendar integration, routing, and API layer are untouched — do not modify anything under `backend/`.

## File Structure

| File | Responsibility after this change |
|---|---|
| `frontend/src/index.css` | Design tokens, fonts, global resets, shared element base styles (buttons, inputs, keyframes) |
| `frontend/src/App.css` | All component-specific classes: header/prompt-line/demo-banner, stats line, shared collapsible-section classes, tracker-columns layout, processes toolbar/list/grid, modal/form |
| `frontend/src/App.jsx` | Header, prompt line, demo banner, tracker-columns wrapper, processes toolbar + list container, feedback modal markup |
| `frontend/src/components/Dashboard.jsx` | Stats line markup |
| `frontend/src/components/ProcessCard.jsx` | List-row and grid-cell markup for a single process, `getStatusColor`/`formatSalary` helpers |
| `frontend/src/components/LeetCodeTracker.jsx` + `.css` | LeetCode column markup + component-specific styles |
| `frontend/src/components/TaskTracker.jsx` + `.css` | Tasks column markup + component-specific styles |
| `frontend/src/components/ProcessForm.jsx` | Unchanged structure; drops the `glass` class |
| `frontend/src/components/AppointmentForm.jsx` | Unchanged structure; drops the `glass` class |

---

### Task 1: Design tokens, fonts, and global elements

**Files:**
- Modify: `frontend/src/index.css` (full-file rewrite)

**Interfaces:**
- Produces: CSS custom properties `--bg-dark`, `--bg-card`, `--text-main`, `--text-body`, `--text-muted`, `--text-faint`, `--border`, `--border-strong`, `--accent`, `--warning`, `--error`, `--neutral-status`; global classes `.container`, `.animate-fade`, `.btn-primary`, `.btn-secondary`; global `@keyframes blink` (consumed by the prompt-line cursor in Task 2) and `@keyframes fadeIn`; base element styles for `button`, `input`, `select`, `textarea`.

- [ ] **Step 1: Replace the entire contents of `frontend/src/index.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

:root {
  --bg-dark: #0B0C0E;
  --bg-card: transparent;
  --text-main: #F2F3F5;
  --text-body: #DCE0E5;
  --text-muted: #5B6472;
  --text-faint: #4A5058;
  --border: #1C1F23;
  --border-strong: #23262B;
  --accent: #3DDC97;
  --warning: #FFB020;
  --error: #FF5C5C;
  --neutral-status: #8B92A0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-body);
  line-height: 1.6;
  font-size: 15px;
  min-height: 100vh;
}

.container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 56px 32px 96px;
}

h1,
h2,
h3 {
  font-weight: 700;
  color: var(--text-main);
}

button {
  cursor: pointer;
  font-family: inherit;
  transition: color 0.15s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

/* Flat inputs — underline only, no fills, no radius */
input,
select,
textarea {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-strong);
  border-radius: 0;
  color: var(--text-body);
  padding: 6px 2px;
  font-size: 14px;
  width: 100%;
  outline: none;
}

select {
  color: #8A93A0;
  cursor: pointer;
}

input[type="date"],
input[type="datetime-local"] {
  color-scheme: dark;
}

input:focus,
select:focus,
textarea:focus {
  border-bottom-color: var(--accent);
}

.btn-primary,
.btn-secondary {
  background: none;
  border: none;
  padding: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  text-decoration: none;
}

.btn-primary {
  color: var(--accent);
  font-weight: 600;
}

.btn-secondary {
  color: var(--text-muted);
  font-weight: 400;
}

.btn-primary:hover,
.btn-secondary:hover {
  text-decoration: underline;
}

.btn-secondary:hover {
  color: var(--text-body);
}
```

- [ ] **Step 2: Verify the app still builds**

Run: `cd frontend && npm run lint && npm run build`
Expected: both commands exit 0. The running app will look visually broken/unstyled in places until later tasks land (components still reference classes this file no longer defines, like `.glass` and `.badge`) — that's expected at this point, not a bug.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/index.css
git commit -m "style: replace design tokens and global elements with flat CLI aesthetic"
```

---

### Task 2: Header, prompt line, demo banner

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/App.css`

**Interfaces:**
- Consumes: `.btn-primary`, `.btn-secondary`, `@keyframes blink` (Task 1); `isDemoMode`, `resetDemoData`, `isGoogleConnected`, `setIsFeedbackOpen`, `setIsFormOpen` (existing `App.jsx` state/imports, unchanged).
- Produces: `.prompt-line`, `.app-header`, `.app-tagline`, `.header-links`, `.calendar-connected`, `.demo-banner` classes (consumed visually only, no other task depends on their names).

- [ ] **Step 1: Replace the header/demo-banner block in `frontend/src/App.jsx`**

Find this block (inside the `return (`, right after `<div className="container">`):

```jsx
      {isDemoMode && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '0.75rem 1.25rem', marginBottom: '1.5rem', border: '1px solid var(--primary)', borderRadius: '0.6rem', background: 'rgba(255, 255, 255, 0.05)' }}>
          <span style={{ fontSize: '0.9rem' }}>
            🧪 <strong>Demo mode</strong> — data lives in your browser only; Google Calendar is simulated.
          </span>
          <button className="btn-secondary" onClick={() => { resetDemoData(); window.location.reload(); }}>
            Reset demo data
          </button>
        </div>
      )}
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Recruitment <span style={{ color: 'var(--primary)' }}>Helper</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your job applications with ease.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {!isGoogleConnected ? (
            <button className="btn-secondary" onClick={() => window.location.href = '/api/auth/google'} style={{ borderColor: '#4285F4', color: '#4285F4' }}>
              Connect Google Calendar
            </button>
          ) : (
            <span style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', color: '#34A853', border: '1px solid #34A853', borderRadius: '4px', backgroundColor: '#34A85310' }}>
              ✓ Google Calendar Connected
            </span>
          )}
          <button className="btn-secondary" onClick={() => setIsFeedbackOpen(true)}>Feedback Summary</button>
          <button className="btn-primary" onClick={() => setIsFormOpen(true)}>+ Add Application</button>
        </div>
      </header>
```

Replace it with:

```jsx
      <div className="prompt-line">
        <span className="prompt-dollar">$</span><span>recruitment-helper --dashboard</span><span className="prompt-cursor"></span>
      </div>

      {isDemoMode && (
        <div className="demo-banner">
          <span># demo_mode — data stored locally, calendar simulated</span>
          <button className="btn-secondary" onClick={() => { resetDemoData(); window.location.reload(); }}>reset</button>
        </div>
      )}
      <header className="app-header">
        <div>
          <h1>Recruitment Helper</h1>
          <p className="app-tagline">Manage your job applications with ease.</p>
        </div>
        <div className="header-links">
          {!isGoogleConnected ? (
            <a href="/api/auth/google" className="btn-secondary">connect_calendar</a>
          ) : (
            <span className="calendar-connected">calendar: connected</span>
          )}
          <button className="btn-secondary" onClick={() => setIsFeedbackOpen(true)}>feedback_summary</button>
          <button className="btn-primary" onClick={() => setIsFormOpen(true)}>[ + new_application ]</button>
        </div>
      </header>
```

- [ ] **Step 2: Add the new classes to `frontend/src/App.css`**

Add at the very top of the file (before the `/* Dashboard */` comment):

```css
/* Prompt line */
.prompt-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 28px;
}

.prompt-dollar {
  color: var(--accent);
}

.prompt-cursor {
  width: 7px;
  height: 14px;
  background: var(--text-muted);
  display: inline-block;
  animation: blink 1s step-end infinite;
}

/* Header */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
}

.app-header h1 {
  font-size: 26px;
  margin-bottom: 6px;
}

.app-tagline {
  font-size: 14px;
  color: var(--text-muted);
}

.header-links {
  display: flex;
  align-items: center;
  gap: 20px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
}

.calendar-connected {
  color: var(--accent);
}

/* Demo banner */
.demo-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
  color: var(--text-faint);
  margin-bottom: 28px;
}
```

- [ ] **Step 3: Verify**

Run: `cd frontend && npm run lint && npm run build`
Expected: both exit 0.

Run: `cd frontend && VITE_DEMO_MODE=true npm run dev`, open `http://localhost:5173`.
Expected: blinking cursor after the `$ recruitment-helper --dashboard` prompt line; demo banner as a plain text line with a `reset` link (demo mode is on, so it should render); header shows plain-text `connect_calendar` / `feedback_summary` / bold green `[ + new_application ]` links with a hairline rule underneath. Clicking `[ + new_application ]` still opens the process form modal (unstyled until Task 7 — that's expected).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.jsx frontend/src/App.css
git commit -m "style: rebuild header, prompt line, and demo banner in flat CLI style"
```

---

### Task 3: Stats line

**Files:**
- Modify: `frontend/src/components/Dashboard.jsx` (full-file rewrite)
- Modify: `frontend/src/App.css`

**Interfaces:**
- Consumes: `processes` prop (unchanged, existing `App.jsx` passes it in already).
- Produces: `.stats-line` block (no other task depends on it).

- [ ] **Step 1: Replace the entire contents of `frontend/src/components/Dashboard.jsx`**

```jsx
import React from 'react';

const Dashboard = ({ processes }) => {
    const stats = {
        total: processes.length,
        interviewing: processes.filter(p => ['Screened', 'Technical', 'Managerial'].includes(p.status)).length,
        offers: processes.filter(p => p.status === 'Offer').length,
        active: processes.filter(p => !['Rejected', 'Ghosted', 'Offer'].includes(p.status)).length
    };

    return (
        <div className="stats-line">
            <span className="stats-value">{stats.total}</span> <span className="stats-word">total</span>
            <span className="stats-sep">/</span>
            <span className="stats-value">{stats.active}</span> <span className="stats-word">active</span>
            <span className="stats-sep">/</span>
            <span className="stats-value stats-warning">{stats.interviewing}</span> <span className="stats-word">interviewing</span>
            <span className="stats-sep">/</span>
            <span className="stats-value stats-accent">{stats.offers}</span> <span className="stats-word">offers</span>
        </div>
    );
};

export default Dashboard;
```

- [ ] **Step 2: Replace the `/* Dashboard */` block in `frontend/src/App.css`**

Find and delete this whole block:

```css
/* Dashboard */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
  opacity: 0.1;
  transform: translate(30%, -30%);
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--text-main), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

Replace it with:

```css
/* Stats */
.stats-line {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
  color: var(--text-body);
  margin-bottom: 40px;
}

.stats-value {
  color: var(--text-main);
  font-weight: 600;
}

.stats-value.stats-warning {
  color: var(--warning);
}

.stats-value.stats-accent {
  color: var(--accent);
}

.stats-word {
  color: var(--text-muted);
}

.stats-sep {
  color: #2E333A;
  margin: 0 10px;
}
```

- [ ] **Step 3: Verify**

Run: `cd frontend && npm run lint && npm run build`
Expected: both exit 0.

In the running dev server, expected: a single mono line `9 total / 4 active / 3 interviewing / 2 offers` (exact numbers depend on seed data) directly under the header, numbers bold white except interviewing (amber) and offers (green).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Dashboard.jsx frontend/src/App.css
git commit -m "style: collapse stat cards into a single inline stats line"
```

---

### Task 4: Tracker layout + LeetCode column

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/App.css`
- Modify: `frontend/src/components/LeetCodeTracker.jsx` (full-file rewrite)
- Modify: `frontend/src/components/LeetCodeTracker.css` (full-file rewrite)

**Interfaces:**
- Produces (in `App.css`, shared by Task 5 too): `.tracker-columns`, `.section-header`, `.section-header-left`, `.section-label`, `.section-toggle-icon`, `.section-content` / `.section-content.collapsed`.
- Produces (in `LeetCodeTracker.css`, used only within this component): `.leetcode-status` (+ `.goal-met` / `.in-progress`), `.leetcode-bar`, `.leetcode-form` (+ children), `.problem-list`, `.problem-item*`, `.difficulty-Easy/Medium/Hard`.

- [ ] **Step 1: Wrap the two trackers in a grid in `frontend/src/App.jsx`**

Find:

```jsx
      <Dashboard processes={processes} />

      <LeetCodeTracker />
      
      <TaskTracker processes={processes} />

      <section>
```

Replace with:

```jsx
      <Dashboard processes={processes} />

      <div className="tracker-columns">
        <LeetCodeTracker />
        <TaskTracker processes={processes} />
      </div>

      <section>
```

- [ ] **Step 2: Add shared layout/section classes to `frontend/src/App.css`**

Add after the `.demo-banner` block from Task 2:

```css
/* Tracker columns (leetcode + tasks) */
.tracker-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-bottom: 48px;
}

/* Shared collapsible section header (leetcode / tasks) */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  cursor: pointer;
  user-select: none;
  margin-bottom: 16px;
}

.section-header-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.section-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  text-transform: lowercase;
}

.section-toggle-icon {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: var(--text-faint);
}

.section-content {
  overflow: hidden;
  max-height: 2000px;
  opacity: 1;
  transition: max-height 0.3s ease, opacity 0.3s ease;
}

.section-content.collapsed {
  max-height: 0;
  opacity: 0;
  pointer-events: none;
}
```

- [ ] **Step 3: Replace the entire contents of `frontend/src/components/LeetCodeTracker.jsx`**

```jsx
import React, { useState, useEffect } from 'react';
import { getProblems, logProblem, getDailyStats } from '../api';
import './LeetCodeTracker.css';

const LeetCodeTracker = () => {
    const [problems, setProblems] = useState([]);
    const [dailyCount, setDailyCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        difficulty: 'Easy'
    });
    const [loading, setLoading] = useState(false);

    const goal = 3;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const allProblems = await getProblems();
            const stats = await getDailyStats();
            setProblems(allProblems);
            setDailyCount(stats.count);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) return;

        setLoading(true);
        try {
            await logProblem(formData);
            setFormData({ title: '', url: '', difficulty: 'Easy' });
            await fetchData();
        } catch (err) {
            console.error('Error logging problem:', err);
        } finally {
            setLoading(false);
        }
    };

    const goalMet = dailyCount >= goal;
    const bar = '█'.repeat(dailyCount) + '░'.repeat(Math.max(goal - dailyCount, 0));

    return (
        <div>
            <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="section-header-left">
                    <span className="section-label"># leetcode</span>
                    <span className={`leetcode-status ${goalMet ? 'goal-met' : 'in-progress'}`}>
                        {dailyCount}/{goal} · {goalMet ? 'goal met' : 'keep going'}
                    </span>
                </div>
                <span className="section-toggle-icon">{isOpen ? '▲' : '▼'}</span>
            </div>

            <div className={`section-content ${isOpen ? '' : 'collapsed'}`}>
                <div className="leetcode-bar">{bar} {dailyCount}/{goal}</div>

                <form className="leetcode-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="title"
                        placeholder="problem title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="url"
                        name="url"
                        placeholder="url (optional)"
                        value={formData.url}
                        onChange={handleChange}
                    />
                    <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                    <button type="submit" className="form-submit-link" disabled={loading}>
                        {loading ? '...' : '↵ log'}
                    </button>
                </form>

                <div className="problem-list">
                    {problems.slice(0, 5).map((p) => (
                        <div key={p._id} className="problem-item">
                            <div className="problem-item-info">
                                <span className="problem-item-title">{p.title}</span>
                                <span className={`problem-item-difficulty difficulty-${p.difficulty}`}>{p.difficulty}</span>
                            </div>
                            {p.url && (
                                <a href={p.url} target="_blank" rel="noopener noreferrer" className="problem-item-link">↗</a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LeetCodeTracker;
```

- [ ] **Step 4: Replace the entire contents of `frontend/src/components/LeetCodeTracker.css`**

```css
.leetcode-status.goal-met {
    color: var(--accent);
}

.leetcode-status.in-progress {
    color: var(--text-muted);
}

.leetcode-bar {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 16px;
    letter-spacing: 2px;
    color: var(--accent);
    margin-bottom: 20px;
}

.leetcode-form {
    display: flex;
    gap: 8px;
    margin-bottom: 22px;
}

.leetcode-form input[name="title"] {
    flex: 2;
    min-width: 0;
}

.leetcode-form select {
    flex: 1;
}

.form-submit-link {
    align-self: center;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    color: var(--accent);
    background: none;
    border: none;
    white-space: nowrap;
    padding: 0;
    font-weight: 600;
    cursor: pointer;
}

.form-submit-link:hover {
    text-decoration: underline;
}

.form-submit-link:disabled {
    color: var(--text-muted);
    cursor: default;
}

.problem-list {
    display: flex;
    flex-direction: column;
}

.problem-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-top: 1px solid #16181B;
}

.problem-item-info {
    min-width: 0;
    display: flex;
    align-items: baseline;
    gap: 10px;
}

.problem-item-title {
    font-size: 14.5px;
    color: var(--text-body);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.problem-item-difficulty {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    flex-shrink: 0;
}

.problem-item-link {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12.5px;
    color: var(--text-faint);
    text-decoration: none;
    flex-shrink: 0;
}

.difficulty-Easy {
    color: var(--accent);
}

.difficulty-Medium {
    color: var(--warning);
}

.difficulty-Hard {
    color: var(--error);
}
```

Note: `.form-submit-link` is defined here (not shared in `App.css`) even though Task 5 will use an identical-looking class in `TaskTracker.css` — that's intentional duplication of ~15 lines to keep each tracker's `.css` file self-contained per the file-structure table, matching how `LeetCodeTracker.css`/`TaskTracker.css` are already two separate files today.

- [ ] **Step 5: Verify**

Run: `cd frontend && npm run lint && npm run build`
Expected: both exit 0.

In the running dev server: LeetCode and Tasks now sit side by side in two columns. LeetCode shows `# leetcode` with a `▲`/`▼` toggle, starts collapsed (matches today's default), and expanding it shows the `█░` progress bar, the title/url/difficulty form, and recent problems as flat rows with a top hairline and a `↗` link. Tasks column will still look like the old boxed style until Task 5.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/App.jsx frontend/src/App.css frontend/src/components/LeetCodeTracker.jsx frontend/src/components/LeetCodeTracker.css
git commit -m "style: rebuild leetcode tracker and two-column tracker layout"
```

---

### Task 5: Tasks column

**Files:**
- Modify: `frontend/src/components/TaskTracker.jsx` (full-file rewrite)
- Modify: `frontend/src/components/TaskTracker.css` (full-file rewrite)

**Interfaces:**
- Consumes: `.section-header`, `.section-header-left`, `.section-label`, `.section-toggle-icon`, `.section-content` (Task 4).
- Produces: `.tasks-pending`, `.task-form` (+ children), `.task-list`, `.task-row*`, `.task-marker*`, `.task-empty` (no other task depends on these names).

- [ ] **Step 1: Replace the entire contents of `frontend/src/components/TaskTracker.jsx`**

```jsx
import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api';
import './TaskTracker.css';

const TaskTracker = ({ processes }) => {
    const [tasks, setTasks] = useState([]);
    const [isOpen, setIsOpen] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        dueDate: '',
        relatedProcess: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const allTasks = await getTasks();
            setTasks(allTasks);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.dueDate) return;

        setLoading(true);
        try {
            await createTask({
                ...formData,
                relatedProcess: formData.relatedProcess || null
            });
            setFormData({ title: '', dueDate: '', relatedProcess: '' });
            await fetchData();
        } catch (err) {
            console.error('Error creating task:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDone = async (task) => {
        try {
            await updateTask(task._id, { isDone: !task.isDone });
            await fetchData();
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await deleteTask(id);
            await fetchData();
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.isDone !== b.isDone) {
            return a.isDone ? 1 : -1;
        }
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const getDaysLeft = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dateString);
        due.setHours(0, 0, 0, 0);
        return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    };

    const formatDaysLeft = (days) => {
        if (days < 0) return `overdue ${Math.abs(days)}d`;
        if (days === 0) return 'due today';
        if (days === 1) return 'due tomorrow';
        return `due in ${days}d`;
    };

    const pendingCount = tasks.filter(t => !t.isDone).length;

    return (
        <div>
            <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="section-header-left">
                    <span className="section-label"># tasks</span>
                    <span className="tasks-pending">{pendingCount} pending</span>
                </div>
                <span className="section-toggle-icon">{isOpen ? '▲' : '▼'}</span>
            </div>

            <div className={`section-content ${isOpen ? '' : 'collapsed'}`}>
                <form className="task-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="title"
                        placeholder="task description"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                    <select
                        name="relatedProcess"
                        value={formData.relatedProcess}
                        onChange={handleChange}
                    >
                        <option value="">-- general --</option>
                        {processes.map(p => (
                            <option key={p._id} value={p._id}>
                                {p.companyName} - {p.position}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="form-submit-link" disabled={loading}>
                        {loading ? '...' : '↵ add'}
                    </button>
                </form>

                <div className="task-list">
                    {sortedTasks.length === 0 ? (
                        <p className="task-empty">No tasks found. Add a new task to get started!</p>
                    ) : (
                        sortedTasks.map((t) => {
                            const daysLeft = getDaysLeft(t.dueDate);
                            const isOverdue = !t.isDone && daysLeft < 0;

                            return (
                                <div key={t._id} className={`task-row ${t.isDone ? 'done' : ''}`}>
                                    <button className={`task-marker ${t.isDone ? 'done' : 'pending'}`} onClick={() => handleToggleDone(t)}>
                                        {t.isDone ? '[x]' : '[ ]'}
                                    </button>
                                    <span className={`task-row-title ${t.isDone ? 'done' : ''}`}>{t.title}</span>
                                    {t.relatedProcess && (
                                        <span className="task-row-related">{t.relatedProcess.companyName || 'process task'}</span>
                                    )}
                                    <span className={`task-row-due ${isOverdue ? 'overdue' : 'due'}`}>{formatDaysLeft(daysLeft)}</span>
                                    <button className="task-row-delete" onClick={() => handleDelete(t._id)} title="Delete task">del</button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskTracker;
```

- [ ] **Step 2: Replace the entire contents of `frontend/src/components/TaskTracker.css`**

```css
.tasks-pending {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    color: var(--warning);
}

.task-form {
    display: flex;
    gap: 8px;
    margin-bottom: 22px;
}

.task-form input[name="title"] {
    flex: 2;
    min-width: 0;
}

.task-form select,
.task-form input[type="date"] {
    flex: 1;
}

.form-submit-link {
    align-self: center;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    color: var(--accent);
    background: none;
    border: none;
    white-space: nowrap;
    padding: 0;
    font-weight: 600;
    cursor: pointer;
}

.form-submit-link:hover {
    text-decoration: underline;
}

.form-submit-link:disabled {
    color: var(--text-muted);
    cursor: default;
}

.task-list {
    display: flex;
    flex-direction: column;
}

.task-row {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 10px 0;
    border-top: 1px solid #16181B;
}

.task-row.done {
    opacity: 0.5;
}

.task-marker {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
}

.task-marker.pending {
    color: var(--text-muted);
}

.task-marker.done {
    color: var(--accent);
}

.task-row-title {
    flex: 1;
    min-width: 0;
    font-size: 14.5px;
    color: var(--text-body);
}

.task-row-title.done {
    text-decoration: line-through;
}

.task-row-related {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: var(--text-faint);
    flex-shrink: 0;
}

.task-row-due {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12.5px;
    flex-shrink: 0;
}

.task-row-due.due {
    color: var(--warning);
}

.task-row-due.overdue {
    color: var(--error);
}

.task-row-delete {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: var(--text-faint);
    background: none;
    border: none;
    padding: 0;
    flex-shrink: 0;
    cursor: pointer;
}

.task-row-delete:hover {
    color: var(--error);
}

.task-empty {
    color: var(--text-muted);
    font-size: 13.5px;
    padding: 10px 0;
}
```

Note on scope: the mockup's task rows show no delete control at all (only checkbox mark, title, related tag, due label). The current app lets you delete a task (🗑️ button). Per the same "don't drop functionality the mockup happens to omit" principle already applied to the related-process dropdown and LeetCode URL field, this plan keeps a `del` text link (`.task-row-delete`) at the end of each row instead of silently removing the ability to delete a task.

- [ ] **Step 3: Verify**

Run: `cd frontend && npm run lint && npm run build`
Expected: both exit 0.

In the running dev server: Tasks column starts expanded (matches today's default), shows `# tasks` + `{n} pending` in amber, the description/related-process/date form row with a `↵ add` link, and task rows with `[ ]`/`[x]` mono markers (clickable to toggle done), muted related-process tag, amber/red due label, and a `del` link. Toggling a task's mark flips it to `[x]`, strikes the title, and dims the row to 50% opacity.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/TaskTracker.jsx frontend/src/components/TaskTracker.css
git commit -m "style: rebuild task tracker in flat mono style"
```

---

### Task 6: Processes — toolbar, list view, and grid view

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/components/ProcessCard.jsx` (full-file rewrite)
- Modify: `frontend/src/App.css`

**Interfaces:**
- Produces: `ProcessCard` now takes an additional `index` prop (0-based); `getStatusColor`/`formatSalary` module-level helpers in `ProcessCard.jsx` (used only within that file).
- Produces (`App.css`): `.processes-toolbar`, `.processes-toolbar-controls`, `.view-toggle*`, `.process-list`, `.process-list-header`, `.process-row*`, `.row-action-link` / `.row-action-delete`, `.process-grid`, `.process-cell*`, `.process-empty`.

- [ ] **Step 1: Replace the processes section in `frontend/src/App.jsx`**

Find:

```jsx
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>Processes</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>Sort:</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="filter-select">
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} 
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} 
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </button>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{filteredAndSortedProcesses.length} items found</span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading processes...</div>
        ) : (
          <div className={viewMode === 'grid' ? "process-grid" : "process-list"}>
            {viewMode === 'list' && filteredAndSortedProcesses.length > 0 && (
              <div className="process-list-header">
                <div className="col-info">Company / Position</div>
                <div className="col-status">Status</div>
                <div className="col-salary">Salary Range</div>
                <div className="col-date">Applied Date</div>
                <div className="col-link">Job Link</div>
                <div className="col-actions">Actions</div>
              </div>
            )}
            {filteredAndSortedProcesses.map(process => (
              <ProcessCard
                key={process._id}
                process={process}
                viewMode={viewMode}
                onEdit={setEditingProcess}
                onDelete={handleDelete}
                onAddAppointment={setAddingAppointmentProcessId}
              />
            ))}
            {filteredAndSortedProcesses.length === 0 && (
              <div className="glass" style={{ padding: '4rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No processes found. Start by adding a new application!</p>
              </div>
            )}
          </div>
        )}
      </section>
```

Replace with:

```jsx
      <section>
        <div className="processes-toolbar">
          <span className="section-label"># processes ({filteredAndSortedProcesses.length})</span>
          <div className="processes-toolbar-controls">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">newest_first</option>
              <option value="asc">oldest_first</option>
            </select>
            <span className="view-toggle">
              <button className={`view-toggle-link ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>list</button>
              <span className="view-toggle-sep">/</span>
              <button className={`view-toggle-link ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>grid</button>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="process-empty">loading processes...</div>
        ) : (
          <div className={viewMode === 'grid' ? "process-grid" : "process-list"}>
            {viewMode === 'list' && filteredAndSortedProcesses.length > 0 && (
              <div className="process-list-header">
                <div>#</div><div>COMPANY / ROLE</div><div>STATUS</div><div>SALARY</div><div>APPLIED</div><div>LINK</div><div style={{ textAlign: 'right' }}>ACTIONS</div>
              </div>
            )}
            {filteredAndSortedProcesses.map((process, i) => (
              <ProcessCard
                key={process._id}
                process={process}
                index={i}
                viewMode={viewMode}
                onEdit={setEditingProcess}
                onDelete={handleDelete}
                onAddAppointment={setAddingAppointmentProcessId}
              />
            ))}
            {filteredAndSortedProcesses.length === 0 && (
              <div className="process-empty">No processes found. Start by adding a new application!</div>
            )}
          </div>
        )}
      </section>
```

- [ ] **Step 2: Replace the entire contents of `frontend/src/components/ProcessCard.jsx`**

```jsx
import React from 'react';

const getStatusColor = (status) => {
    switch (status) {
        case 'Applied': return 'var(--neutral-status)';
        case 'Screened':
        case 'Technical':
        case 'Managerial': return 'var(--warning)';
        case 'Offer': return 'var(--accent)';
        case 'Rejected':
        case 'Ghosted': return 'var(--error)';
        default: return 'var(--text-muted)';
    }
};

const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return '—';
    const min = salary.min ? Math.round(salary.min / 1000) : 0;
    const max = salary.max ? Math.round(salary.max / 1000) : 0;
    return `${min}–${max}k ${salary.currency}`;
};

const ProcessCard = ({ process, index, onEdit, onDelete, onAddAppointment, viewMode }) => {
    const statusColor = getStatusColor(process.status);

    if (viewMode === 'list') {
        return (
            <div className="process-row">
                <div className="process-row-idx">{String(index + 1).padStart(2, '0')}</div>
                <div>
                    <div className="process-row-company">{process.companyName}</div>
                    <div className="process-row-position">{process.position}</div>
                </div>
                <div className="process-row-status" style={{ color: statusColor }}>{process.status}</div>
                <div className="process-row-salary">{formatSalary(process.salary)}</div>
                <div className="process-row-date">{new Date(process.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div>
                    {process.jobUrl ? (
                        <a href={process.jobUrl} target="_blank" rel="noopener noreferrer" className="process-row-link">view ↗</a>
                    ) : (
                        <span className="process-row-link-empty">—</span>
                    )}
                </div>
                <div className="process-row-actions">
                    <button onClick={() => onEdit(process)} className="row-action-link">edit</button>
                    <button onClick={() => onDelete(process._id)} className="row-action-link row-action-delete">del</button>
                </div>
            </div>
        );
    }

    const hasFeedback = process.status === 'Rejected' && process.rejectionFeedback;
    const hasAppointments = process.appointments && process.appointments.length > 0;

    return (
        <div className="process-cell">
            <div className="process-cell-header">
                <div>
                    <div className="process-cell-company">{process.companyName}</div>
                    <div className="process-cell-position">{process.position}</div>
                </div>
                <span className="process-cell-status" style={{ color: statusColor }}>{process.status}</span>
            </div>

            <div className="process-cell-meta">
                <div>{formatSalary(process.salary)}</div>
                <div className="process-cell-meta-date">{new Date(process.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                {process.jobUrl && (
                    <a href={process.jobUrl} target="_blank" rel="noopener noreferrer" className="process-cell-link">view_posting ↗</a>
                )}
            </div>

            {hasFeedback && (
                <div className="process-cell-feedback">{process.rejectionFeedback}</div>
            )}

            {hasAppointments && (
                <div className="process-cell-appointments">
                    {process.appointments.map(app => (
                        <div key={app._id || app.eventId}>{app.title} — {new Date(app.startTime).toLocaleString('en-US')}</div>
                    ))}
                </div>
            )}

            <div className="process-cell-footer">
                <button onClick={() => onEdit(process)} className="row-action-link">edit</button>
                <button onClick={() => onDelete(process._id)} className="row-action-link row-action-delete">del</button>
                <button onClick={() => onAddAppointment(process._id)} className="row-action-link process-cell-add-appt">+ appt</button>
            </div>
        </div>
    );
};

export default ProcessCard;
```

- [ ] **Step 3: Replace the `/* ProcessGrid */`, `/* ProcessCard */`, `/* Filters */`, `/* View Toggle */`, `/* Process List (List View Container) */` blocks and the trailing media query in `frontend/src/App.css`**

Delete this whole span (from `/* ProcessGrid */` down to the closing `}` of the `@media (max-width: 1024px)` block at the end of the file):

```css
/* ProcessGrid */
.process-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* ProcessCard */
.process-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border);
}

.process-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.5);
  border-color: var(--primary);
  background: rgba(30, 41, 59, 0.9);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.position-text {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
}

.card-body {
  font-size: 0.9rem;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.salary-info {
  color: var(--text-main);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.job-link {
  color: var(--primary);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 0.5rem;
  display: inline-block;
  transition: color 0.2s;
}

.job-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.btn-icon {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 0.4rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main);
  border-color: var(--text-muted);
}

.btn-delete:hover {
  color: var(--error);
  border-color: var(--error);
  background: rgba(239, 68, 68, 0.1);
}

/* Modal and Form */
```

**Stop deleting right before `/* Modal and Form */`** — leave that comment and everything below it (Task 7 handles it). Also delete the `/* Filters */` through end-of-file block separately:

```css
/* Filters */
.filter-group {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.4rem 0.8rem;
  border-radius: 0.6rem;
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.filter-group:focus-within {
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.05);
}

.filter-select {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 0.9rem;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  padding-right: 0.5rem;
}

.filter-select option {
  background: #0f172a;
  color: var(--text-main);
}

/* View Toggle */
.view-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  padding: 2px;
  border-radius: 0.6rem;
  border: 1px solid var(--border);
}

.toggle-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toggle-btn:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.05);
}

.toggle-btn.active {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Process List (List View Container) */
.process-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.process-card.list-view {
  display: grid;
  grid-template-columns: 250px 120px 1fr 120px 120px 160px;
  align-items: center;
  padding: 0.75rem 1.5rem;
  gap: 1.5rem;
  min-height: 70px;
}

.process-list-header {
  display: grid;
  grid-template-columns: 250px 120px 1fr 120px 120px 160px;
  align-items: center;
  padding: 0.5rem 1.5rem;
  gap: 1.5rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.5rem;
}

.process-list-header .col-actions {
  display: flex;
  justify-content: flex-end;
}

.process-card.list-view .col-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.process-card.list-view .col-status {
  display: flex;
  justify-content: flex-start;
}

.process-card.list-view .col-salary {
  display: flex;
  align-items: center;
  color: var(--text-main);
  font-weight: 500;
}

.process-card.list-view .col-date {
  color: var(--text-muted);
}

.process-card.list-view .col-actions {
  display: flex;
  justify-content: flex-end;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.process-card.list-view:hover .list-actions {
  opacity: 1;
}

@media (max-width: 1024px) {
  .process-card.list-view,
  .process-list-header {
    grid-template-columns: 200px 100px 1fr 100px 100px 140px;
    gap: 1rem;
    font-size: 0.9rem;
  }
  .process-list-header {
    font-size: 0.65rem;
  }
}
```

Replace both deleted spans with this single block (put it where `/* Filters */` was, i.e. directly before `/* Modal and Form */`):

```css
/* Processes toolbar */
.processes-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 18px;
}

.processes-toolbar-controls {
  display: flex;
  gap: 18px;
  align-items: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
}

.view-toggle {
  display: flex;
  gap: 6px;
}

.view-toggle-link {
  background: none;
  border: none;
  padding: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: var(--text-muted);
  cursor: pointer;
}

.view-toggle-link.active {
  color: var(--accent);
  font-weight: 600;
}

.view-toggle-sep {
  color: #2E333A;
}

.process-empty {
  padding: 4rem;
  text-align: center;
  grid-column: 1 / -1;
  color: var(--text-muted);
  font-size: 14px;
}

/* Process list (table) view */
.process-list {
  display: flex;
  flex-direction: column;
}

.process-list-header {
  display: grid;
  grid-template-columns: 32px 1.6fr 1fr 1fr 0.9fr 0.7fr 110px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-strong);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  color: var(--text-faint);
  letter-spacing: 0.05em;
}

.process-row {
  display: grid;
  grid-template-columns: 32px 1.6fr 1fr 1fr 0.9fr 0.7fr 110px;
  padding: 16px 0;
  border-bottom: 1px solid #16181B;
  align-items: center;
}

.process-row-idx {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: var(--text-faint);
}

.process-row-company {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--text-main);
}

.process-row-position {
  font-size: 12.5px;
  color: var(--text-muted);
}

.process-row-status {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
}

.process-row-salary {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: #B7BDC6;
}

.process-row-date {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: var(--text-muted);
}

.process-row-link,
.process-row-link-empty {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
  text-decoration: none;
}

.process-row-link {
  color: var(--accent);
}

.process-row-link-empty {
  color: var(--text-muted);
}

.process-row-actions {
  display: flex;
  gap: 14px;
  justify-content: flex-end;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
}

.row-action-link {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--text-muted);
  text-decoration: none;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
}

.row-action-link:hover {
  color: var(--text-body);
}

.row-action-delete {
  color: var(--error);
}

.row-action-delete:hover {
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .process-list-header,
  .process-row {
    grid-template-columns: 24px 1.4fr 0.8fr 0.9fr 0.8fr 0.6fr 90px;
    font-size: 0.9em;
  }
}

/* Process grid (cards) view */
.process-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
}

.process-cell {
  background: var(--bg-dark);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.process-cell-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.process-cell-company {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
}

.process-cell-position {
  font-size: 12.5px;
  color: var(--text-muted);
}

.process-cell-status {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
}

.process-cell-meta {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
  color: #8A93A0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.process-cell-meta-date {
  color: var(--text-faint);
}

.process-cell-link {
  color: var(--accent);
  text-decoration: none;
}

.process-cell-feedback {
  font-size: 12.5px;
  color: #8A93A0;
  border-left: 2px solid var(--error);
  padding-left: 10px;
  white-space: pre-wrap;
}

.process-cell-appointments {
  border-top: 1px solid var(--border);
  padding-top: 8px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  color: var(--text-muted);
}

.process-cell-appointments > div {
  margin-bottom: 4px;
}

.process-cell-footer {
  display: flex;
  gap: 14px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
}

.process-cell-add-appt {
  margin-left: auto;
}
```

- [ ] **Step 4: Verify**

Run: `cd frontend && npm run lint && npm run build`
Expected: both exit 0.

In the running dev server: `# processes (N)` label with underline-only status/sort selects and a `list / grid` text toggle (active one bold green). List view: numbered rows (`01`, `02`, ...), status as plain colored mono text, `edit`/`del` as plain text links, hairline row separators. Grid view: cards in a hairline 1px grid (no rounded corners/shadow/hover-lift), rejection feedback shown as a left-rule quote on a Rejected process with feedback (seed data includes one), `edit` / `del` / `+ appt` links in the footer. Switching between list/grid, filtering by status, and sorting all still work.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.jsx frontend/src/components/ProcessCard.jsx frontend/src/App.css
git commit -m "style: rebuild processes toolbar, list view, and grid view in flat CLI style"
```

---

### Task 7: Modals — ProcessForm, AppointmentForm, Feedback Summary

**Files:**
- Modify: `frontend/src/components/ProcessForm.jsx`
- Modify: `frontend/src/components/AppointmentForm.jsx`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/App.css`

**Interfaces:**
- Consumes: `.btn-primary`, `.btn-secondary`, global `input`/`select`/`textarea` styles (Task 1).
- Produces: `.modal-header`, `.modal-header-meta`, `.modal-hint`, `.feedback-textarea` (used only in the feedback modal in `App.jsx`).

- [ ] **Step 1: Drop the `glass` class in `frontend/src/components/ProcessForm.jsx`**

Find:

```jsx
        <div className="modal-content glass animate-fade">
```

Replace with:

```jsx
        <div className="modal-content animate-fade">
```

- [ ] **Step 2: Drop the `glass` class in `frontend/src/components/AppointmentForm.jsx`**

Find:

```jsx
        <div className="modal-content glass animate-fade">
```

Replace with:

```jsx
        <div className="modal-content animate-fade">
```

- [ ] **Step 3: Restyle the Feedback Summary modal in `frontend/src/App.jsx`**

Find:

```jsx
      {isFeedbackOpen && (
        <div className="modal-overlay" onClick={() => setIsFeedbackOpen(false)}>
          <div className="modal-content glass" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Feedback Summary</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {processes.filter(p => p.rejectionFeedback && p.rejectionFeedback.trim()).length} entries
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Copy this prompt into an LLM to get a structured learning plan based on your rejection feedback.
            </p>
            <textarea
              readOnly
              value={buildFeedbackText()}
              style={{
                width: '100%',
                minHeight: '400px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border)',
                borderRadius: '0.6rem',
                color: 'var(--text-main)',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                lineHeight: '1.6',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsFeedbackOpen(false)}>Close</button>
              <button className="btn-primary" onClick={handleCopyFeedback}>
                {feedbackCopied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}
```

Replace with:

```jsx
      {isFeedbackOpen && (
        <div className="modal-overlay" onClick={() => setIsFeedbackOpen(false)}>
          <div className="modal-content animate-fade" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Feedback Summary</h2>
              <span className="modal-header-meta">
                {processes.filter(p => p.rejectionFeedback && p.rejectionFeedback.trim()).length} entries
              </span>
            </div>
            <p className="modal-hint">
              Copy this prompt into an LLM to get a structured learning plan based on your rejection feedback.
            </p>
            <textarea readOnly value={buildFeedbackText()} className="feedback-textarea" />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsFeedbackOpen(false)}>close</button>
              <button className="btn-primary" onClick={handleCopyFeedback}>
                {feedbackCopied ? 'copied!' : '↵ copy_to_clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}
```

- [ ] **Step 4: Replace the `/* Modal and Form */` block in `frontend/src/App.css`**

Find and delete:

```css
/* Modal and Form */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-content {
  width: 90%;
  max-width: 650px;
  padding: 2.5rem;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.form-row {
  display: flex;
  gap: 1.25rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 0.75rem 1.5rem;
  border-radius: 0.6rem;
  font-weight: 600;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main);
}
```

Replace with:

```css
/* Modal and Form */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 650px;
  padding: 2rem;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-dark);
  border: 1px solid var(--border);
}

.modal-content h2 {
  font-size: 18px;
  margin-bottom: 1.5rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
}

.modal-header-meta {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: var(--text-muted);
}

.modal-hint {
  color: var(--text-muted);
  font-size: 13px;
  margin-bottom: 1rem;
}

.feedback-textarea {
  width: 100%;
  min-height: 400px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-body);
  padding: 1rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  box-sizing: border-box;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1.25rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}
```

Note: `.btn-secondary` is intentionally **not** redefined here anymore — it now comes solely from the global rule in `index.css` (Task 1), removing the duplicate/conflicting definition that used to live in `App.css`.

- [ ] **Step 5: Verify**

Run: `cd frontend && npm run lint && npm run build`
Expected: both exit 0.

In the running dev server: open "New Application" (`[ + new_application ]`), "Add appointment" (from a grid card's `+ appt` link), and "Feedback Summary" (`feedback_summary` header link) — all three modals should show a flat panel (no blur, no rounded corners, no drop shadow), mono field labels, underline-only inputs, and text-link-style Cancel/Submit actions. Submitting/canceling each still works exactly as before.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ProcessForm.jsx frontend/src/components/AppointmentForm.jsx frontend/src/App.jsx frontend/src/App.css
git commit -m "style: rebuild modals (process form, appointment form, feedback summary) in flat style"
```

---

### Task 8: Responsive fallback

**Files:**
- Modify: `frontend/src/App.css`

**Interfaces:**
- Consumes: `.tracker-columns` (Task 4), `.container` / `.app-header` / `.header-links` (Tasks 1–2). No new class names produced.

- [ ] **Step 1: Add responsive rules to the end of `frontend/src/App.css`**

```css
@media (max-width: 900px) {
  .tracker-columns {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 32px 16px 64px;
  }

  .app-header {
    align-items: flex-start;
  }

  .header-links {
    flex-wrap: wrap;
    gap: 12px;
  }
}
```

(This is in addition to the `.process-list-header`/`.process-row` breakpoint already added in Task 6 — both breakpoints coexist as separate `@media` blocks in the same file.)

- [ ] **Step 2: Verify**

Run: `cd frontend && npm run lint && npm run build`
Expected: both exit 0.

In the running dev server, use the browser's responsive/device toolbar to shrink the viewport:
- Below ~1024px: the processes list-view table columns compress (smaller font, tighter gaps) instead of overflowing.
- Below ~900px: the LeetCode and Tasks columns stack into a single column instead of being squeezed side by side.
- Below ~640px: the page's outer padding shrinks and the header wraps its links onto a new line instead of overflowing horizontally.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.css
git commit -m "style: add responsive fallback for tracker columns and narrow viewports"
```

---

### Task 9: Final cleanup and full manual QA pass

**Files:**
- Modify: `frontend/src/App.css` (dead-code removal only, if any is found)

**Interfaces:** None — this task only removes unused CSS and verifies the end-to-end result of Tasks 1–8.

- [ ] **Step 1: Search for now-dead class references**

Run: `cd frontend && grep -rn "className=\"glass\|className={.*glass\|\bbadge\b\|filter-group\|filter-select\|toggle-btn\|stat-card\|stat-label\|stat-value\|process-card\b\|col-info\|col-status\|col-salary\|col-date\|col-link\|col-actions\|btn-icon\|list-actions" src/`
Expected: no matches in `.jsx`/`.css` files (all of these class names were removed or renamed across Tasks 1–7). If anything turns up, delete the dead rule/reference.

- [ ] **Step 2: Full lint + build**

Run: `cd frontend && npm run lint && npm run build`
Expected: both exit 0, with zero warnings about unused variables/classes introduced by this redesign.

- [ ] **Step 3: Manual QA walkthrough**

Run: `cd frontend && VITE_DEMO_MODE=true npm run dev`, open `http://localhost:5173`, and walk through:
1. Prompt line renders with a blinking cursor.
2. Demo banner shows; clicking `reset` reloads with fresh seed data.
3. Header links: `connect_calendar` (demo mode simulates Google connection state), `feedback_summary` opens the modal, `[ + new_application ]` opens the process form.
4. Stats line shows correct totals matching the seed data.
5. LeetCode: starts collapsed; expand it, log a new problem with a URL, confirm it appears with a `↗` link and the correct difficulty color; confirm the block-bar updates.
6. Tasks: starts expanded; add a task tied to a specific process via the related-process select; toggle a task done (strikethrough + dim); delete a task via `del`.
7. Processes: switch between `list` and `grid`; filter by each status in the dropdown; change sort order; confirm a Rejected process with feedback shows the left-rule quote in grid view; confirm `edit`, `del`, and (grid-only) `+ appt` all work.
8. Resize the browser below 1024px, 900px, and 640px and confirm the responsive behavior from Task 8.
9. Confirm zero border-radius/box-shadow/blur anywhere on the page (visually).

Expected: every interaction above behaves exactly as it did before the redesign — only the visual layer changed.

- [ ] **Step 4: Commit (only if Step 1 found dead code to remove)**

```bash
git add frontend/src/App.css
git commit -m "chore: remove dead CSS left over from the pre-redesign styles"
```

If Step 1 found nothing to remove, skip this commit — there's nothing to commit.
