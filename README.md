# Event Management Platform

A responsive web application for browsing, registering for and managing events. It consumes the provided Event Management REST API and supports two roles: regular users and administrators.

**Live demo:** https://event-managment-p.netlify.app

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [API Configuration](#api-configuration)
- [Application Startup](#application-startup)
- [Build & Deployment](#build--deployment)
- [Test Accounts](#test-accounts)
- [Project Structure](#project-structure)
- [Routes](#routes)
- [Assumptions, Limitations and Trade-offs](#assumptions-limitations-and-trade-offs)

---

## Features

**Authentication**
- Register and log in with client-side validation.
- Session persisted across page reloads.
- Role-based routing: admins land on the dashboard, users land on the events list.
- Protected routes. Non-admins cannot open admin pages.

**User area**
- Paginated list of upcoming events with search (name/description), event type filter and date range filter.
- Event details: name, description, date and time, type, maximum capacity and current registration count.
- Registration form with optional LinkedIn URL, education level and motivation.
- "My registrations" page showing every registration with its status.

**Admin dashboard**
- Paginated list of all events, including past ones, with search, type filter and date range filter.
- Create events with validation.
- Delete events behind a confirmation dialog.
- Paginated registrations list per event, with registrant details and status.
- Approve pending registrations (PENDING → APPROVED).

**Business rules reflected in the UI**
- Past events are labelled, dimmed, and registration is disabled.
- Events at full capacity show a "Full" badge and registration is disabled.
- All forms validate on the client with inline, descriptive error messages.
- Every request has loading, success and error feedback (skeletons, toasts, retry buttons, empty states).

---

## Tech Stack

| Area | Choice |
|---|---|
| Framework | Next.js (App Router) with React |
| Language | TypeScript |
| Styling / UI | Tailwind CSS + shadcn/ui |
| State management | Zustand (auth session, persisted) |
| HTTP | Axios (with request/response interceptors) |
| Forms & validation | React Hook Form + Zod |
| Notifications | Sonner |

---

## Setup Instructions

**Requirements**
- Node.js 20.9 or later
- npm

**Steps**

```bash
git clone <your-repository-url>
cd <repository-folder>
npm install
cp .env.example .env.local      # on Windows PowerShell: Copy-Item .env.example .env.local
```

The repository contains an `.npmrc` file with `legacy-peer-deps=true`. It is there because one of the form-validation packages declares an optional peer dependency (`effect`) that conflicts with the installed version, which makes a plain `npm install` fail with an `ERESOLVE` error. The package is not used by this project, so ignoring the conflict is safe.

---

## API Configuration

The API base URL is read from an environment variable, so no URL is hard-coded in the source.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Event Management API, without a trailing slash |

Example `.env.local`:

```
NEXT_PUBLIC_API_URL=https://events-management-api-847aeb3c849e.hosted.ghaymah.systems
```

`NEXT_PUBLIC_` variables are inlined at build time. After changing the value, restart the dev server or rebuild/redeploy.

---

## Application Startup

```bash
npm run dev
```

Then open http://localhost:3000.

---

## Build & Deployment

**Production build (local)**

```bash
npm run build
npm start
```

**Deployment**

The app is deployed on Netlify: https://event-managment-p.netlify.app

To deploy your own copy:
1. Push the repository to GitHub and import it in Netlify (or Vercel).
2. Keep the detected Next.js settings (`npm run build`).
3. Add the `NEXT_PUBLIC_API_URL` environment variable before the first deploy.
4. If the variable is added or changed later, trigger a new deploy (clear cache and deploy), because it is baked in at build time.

---

## Test Accounts

| Role | Credentials |
|---|---|
| Admin | `admin@example.com` / `admin123` (default seeded account from the API documentation) |
| User | Create one from the **Register** page. All new accounts have the `USER` role. |

**Suggested walkthrough:** register a user, register for an upcoming event, log in as admin, open the event's registrations and approve it, then log back in as the user and check "My registrations".

---

## Project Structure

```
src/
  app/                  Routes (pages only: composition of components and hooks)
    admin/              Dashboard, create event, event registrations
    events/             Events list and event details
    login/ register/    Authentication pages
    my-registrations/   User registration history
  components/           Presentational and feature components
    ui/                 shadcn/ui primitives
  hooks/                Data-fetching and state hooks (useEvent, useUpcomingEvents, ...)
  services/             API calls, one function per endpoint (no UI code)
  stores/               Zustand stores (auth)
  lib/                  Axios client, JWT/session helpers, formatting and error helpers
  types/                Shared TypeScript types matching the API contract
```

The layers are intentionally separate: **services** talk to the API, **hooks** manage loading/error/data state, **components** render UI, and **pages** wire them together.

---

## Routes

| Route | Access | Description |
|---|---|---|
| `/login`, `/register` | Public | Authentication |
| `/events` | Authenticated | Upcoming events list |
| `/events/[id]` | Authenticated | Event details and registration |
| `/my-registrations` | Authenticated (user) | Registration history |
| `/admin` | Admin | All events, delete |
| `/admin/events/new` | Admin | Create event |
| `/admin/events/[id]/registrations` | Admin | Registrations and approval |

---

## Performance and Bundle Analysis

The production bundle was analyzed with Next.js's built-in Turbopack bundle analyzer (`npx next experimental-analyze`).

**Findings**
- Most of the JavaScript is the framework itself (`next` ≈ 274 KB and `react-dom` ≈ 62 KB in the analyzer's estimates). The application's own code is small (≈ 30 KB on the admin route).
- The largest third-party libraries are `zod` (≈ 66 KB), `axios` (≈ 49 KB), Radix UI primitives (≈ 45–49 KB), `react-hook-form` (≈ 22 KB) and `sonner` (≈ 18 KB).
- The App Router already splits code per route, so form libraries are not loaded on pages without forms (for example `/events`).

**What was done**
- The registration form (`react-hook-form` + `zod`) and the delete-confirmation dialog are loaded on demand with `next/dynamic`, with skeleton/disabled-button fallbacks to avoid layout shifts.
- Result on `/events/[id]`: the route's total code is ≈ 485 KB, of which ≈ 361 KB is initial load; `zod` and `react-hook-form` (≈ 88 KB) are no longer part of the first load. For comparison, `/events` is ≈ 431 KB initial of ≈ 473 KB total and `/admin` is ≈ 438 KB initial of ≈ 480 KB total.
- These are the analyzer's estimates, not a controlled before/after benchmark.

**Ideas for further reduction**
- Replace `axios` with a thin `fetch` wrapper (≈ 49 KB in the analyzer).
- Use `zod/mini` or a lighter validation approach.
- Lazy-load the toast library until the first notification.

## Assumptions, Limitations and Trade-offs

### Assumptions

- **Role detection.** The login response only returns an access token. The user's role (`role`) and expiry (`exp`) are read by decoding the JWT payload on the client. This is used only to decide what UI to show. It does not verify the signature, and real authorization is enforced by the API.
- **Past events for regular users.** The API returns `404` when a non-admin requests a past event. The user list therefore never contains past events, and a user opening a past event URL sees a "not found" message. The "Past" label and disabled registration are visible to admins and in "My registrations".
- **Full events.** "Full" is derived from `registrationCount >= max_attendees`. The event details endpoint always returns `registrationCount`, so the details page is authoritative. List cards show the Full badge only when the list response includes that field.
- **Admins and registration.** Admins manage registrations, so the UI hides the registration form for them and links to the event's registrations page instead. The API itself does not forbid it, so this rule is enforced in the UI only.
- **Validation rules chosen by me** (the API documentation does not define them): password minimum 6 characters, motivation maximum 500 characters, LinkedIn must be an `http(s)` URL when provided, and max attendees must be a whole number of at least 1. The create-event form deliberately allows past dates so that past-event behaviour can be tested.
- **Registrant details.** The attendees endpoint returns only the registrant's email (no name), so the admin table shows email, registration date, education level, LinkedIn link, motivation and status.
- **Dates.** The create form uses a local date-time input and sends an ISO (UTC) timestamp. Dates are displayed in the browser's locale settings.

### Limitations

- **Session lifetime.** Tokens expire after one hour and there is no refresh-token endpoint. When the token expires, the user is redirected to the login page.
- **Token storage.** The token is stored in `localStorage` (via Zustand `persist`). This is simple and survives reloads, but it is exposed to XSS, unlike an `httpOnly` cookie. A cookie-based session would need API support.
- **Route protection is client-side.** Because the token lives in the browser, the server cannot know who is logged in. Protected pages show a loading state and redirect from the client. No private data is rendered before authentication, since data is only requested after the guard passes.
- **No reject action.** The API exposes only an approve endpoint, so administrators cannot reject registrations. A `REJECTED` status is rendered if the API returns one.
- **Not implemented:** editing events (the API supports `PATCH /events/{id}`, but the specification did not require it), the audit log endpoint, localization (English/Arabic with RTL), and automated tests.
- **Registration status after refresh.** The event details page does not check whether the current user already registered. A duplicate attempt is rejected by the API and its message is shown in a toast.

### Trade-offs

- **Client-side data fetching with custom hooks** instead of React Query/SWR. It keeps dependencies small and the data flow easy to follow, and includes cancellation of stale requests. The cost is no caching, deduplication or background refetching.
- **Mostly client components.** Because authentication depends on a browser-stored token, pages fetch data on the client. This gives up server rendering benefits (first paint with data, SEO), which matter little for an authenticated dashboard.
- **Native `<select>` in a few forms** (gender, education level, event type on create) instead of the shadcn `Select`, because it integrates directly with React Hook Form and is accessible on mobile by default. The filters use the shadcn `Select`.
- **Debounced search (400 ms)** to limit requests while typing. Changing any filter resets pagination to page 1.
- **Pagination sizes** are fixed (9 per page for users, 10 for admins). They are constants and easy to change.

### Improvements with more time

- Add English/Arabic localization with RTL layout, including translatable API error messages.
- Introduce TanStack Query for caching and request deduplication, and optimistic updates for approvals.
- Add unit and integration tests (validation schemas, hooks, guard logic) and end-to-end tests of the registration flow.
- Move the session to an `httpOnly` cookie with refresh tokens if the API supports it.
- Add event editing, registration rejection and an audit log viewer for admins.
- Improve accessibility further (focus management in dialogs, screen-reader announcements for async states).