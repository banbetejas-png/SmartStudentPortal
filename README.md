# Smart Student Portal

A mobile-first Progressive Web App (PWA) built for university students to manage attendance, subjects, marks, fees, tasks, and timetable — all offline in the browser using device storage.

## Features

- **Student onboarding** — Create a local profile (name, student ID, email, branch, year, semester). No email verification or cloud account required.
- **Today-first dashboard** — Greeting, attendance progress ring, today's schedule with inline Present/Absent/Off marking, upcoming deadlines, and quick links.
- **Subject manager** — Add subjects per semester with name, code, type (Theory/Lab), credits, and custom exam scheme (IA + External max marks). Subjects sync across Attendance and Academics.
- **Attendance tracker** — Semester-filtered subject list and weekly timetable grid with daily attendance markers.
- **Academics hub** —
  - **Marks:** IA 1, IA 2, and External marks per subject with automatic pass/fail based on each subject's exam scheme.
  - **Fees:** 8-semester fee cards with paid/total amounts and receipt upload.
- **Tasks & reminders** — Active and completed task lists with due-soon warnings.
- **Profile** — View/edit profile details, About Us card, and logout.
- **PWA / offline** — Installable on phones, works offline after first load.

## Tech Stack

- [React 19](https://react.dev/)
- [TanStack Start](https://tanstack.com/start/) + [TanStack Router](https://tanstack.com/router/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) for authentication and data
- [lucide-react](https://lucide.dev/) icons
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for the service worker and manifest

## Local Development

This project uses **npm** and **Node 20**. If you use `nvm`, run:

```bash
nvm use
```

Then:

```bash
# 1. Clone the repository
git clone <this-repository-url>
cd <repository-name>

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:8080` by default.

### Other useful commands

```bash
# Build for production
npm run build

# Preview the production build
npm run preview

# Lint
npm run lint

# Format code
npm run format
```

## Project Structure

```text
src/
  components/        # Reusable UI components (AppShell, ProgressRing, AddSubjectModal, etc.)
  hooks/             # Custom React hooks
  lib/               # State/store, helpers, and utilities
  routes/            # TanStack Start file-based routes
  router.tsx         # Router configuration
  server.ts          # SSR server entry wrapper
  start.ts           # App start configuration
  styles.css         # Global styles and Tailwind theme tokens
public/              # Static assets (PWA icons, favicon, robots.txt)
vite.config.ts       # Vite + PWA configuration
```

## How Data Works

All data is stored locally in the browser (`localStorage`). This means:

- ✅ Works fully offline after first load.
- ✅ No login, backend, or database setup needed.
- ⚠️ Data is tied to the device/browser. Clearing browser data will erase it.

## PWA / Offline Notes

- The service worker only registers on the production build, not in local dev.
- To test offline installation, open the deployed URL on your phone, then use **Add to Home Screen** (Chrome/Safari).
- After installing, the app can be opened from the home screen icon and works offline.

## Developers

- Tejas Banbe
- Atharva Bahulekar
- Mayur Bhoi
- Soham Bendal

**Version:** 1.0 (NEP Compliant)
