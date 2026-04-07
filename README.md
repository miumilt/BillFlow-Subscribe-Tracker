<div align="center">

# BillFlow

Telegram Mini App portfolio project for subscription tracking with a polished green dashboard UI, animated widgets, and offline-first persistence.

<p>
  <img src="https://img.shields.io/badge/React-18-111827?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-111827?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-111827?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-5-111827?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Telegram-Mini_App-111827?style=for-the-badge&logo=telegram" alt="Telegram Mini App" />
  <img src="https://img.shields.io/badge/Data-Offline_First-166534?style=for-the-badge" alt="Offline First" />
</p>

</div>

---

## Demo

- Live demo URL: add your deployed link here.
- Local desktop preview: `npm run dev`.
- Production build: `npm run build`.

<p align="center">
  <img src="trc1.gif1" width="400"> <img src="trc2.gif2" width="400">
</p>

### Mobile Flow

Use your own screenshots in `./media/` and reference them here.

```md
![Mobile flow](./media/mobile-flow.png)
![Dashboard widgets](./media/dashboard-widgets.png)
```

---

## Features

### Product Experience

- Widget-driven dashboard with health score, momentum trend, largest plan, and renewal cards.
- Subscription CRUD with smooth micro-interactions and contextual actions.
- Analytics view with category and billing-cycle charts.
- Responsive layout optimized for Telegram mobile viewport.

### Data Layer

- Offline-first storage via local persistence (`localStorage`).
- No backend required for full demo functionality.
- Optional Supabase mode remains available for real backend usage.

### UX and Motion

- Green neon visual system with glass cards and gradient controls.
- Staggered entrances, shimmer skeletons, and interaction feedback.
- Touch-first navigation with polished bottom app bar.

---

## What This Portfolio Project Demonstrates

- Building a complete Telegram Mini App instead of a static showcase page.
- Structuring code by features, hooks, and shared UI primitives.
- Designing and shipping an offline-capable product flow end to end.
- Keeping backend integration optional while preserving production-ready architecture.

---

## Architecture

High-level flow:

1. App shell initializes Telegram WebApp context in `src/hooks/useTelegram.ts`.
2. Subscription and category operations are handled through `src/hooks/useSubscriptions.ts`.
3. Dashboard aggregates are calculated in `src/hooks/useDashboard.ts`.
4. Data mode is resolved in `src/lib/dataMode.ts`.
5. In offline mode, persistence is handled in `src/lib/localData.ts`.

### Data Modes

| Mode | Trigger | Storage | Notes |
|---|---|---|---|
| Offline-first (default) | Missing Supabase env or `VITE_FORCE_LOCAL_DATA=true` | `localStorage` | Full app works without backend |
| Supabase | Valid Supabase env present | Supabase DB | Optional production backend mode |

---

## Project Structure

```text
newminiapp/
  public/
  src/
    components/
      layout/
      loading/
      ui/
    features/
      analytics/
      dashboard/
      subscriptions/
    hooks/
      useDashboard.ts
      useSubscriptions.ts
      useTelegram.ts
    lib/
      dataMode.ts
      localData.ts
      supabase.ts
      utils.ts
    types/
      index.ts
    App.tsx
    index.css
    main.tsx
  supabase/
    migrations/
    functions/
  README.md
```

---

## Environment

Create `.env` from `.env.example`.

```bash
cp .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

Available variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_BOT_TOKEN=
VITE_FORCE_LOCAL_DATA=false
```

If Supabase keys are empty, the app runs in offline-first mode automatically.

---

## Run Locally

```bash
npm install
npm run dev
```

## Typecheck

```bash
npm run typecheck
```

## Production Build

```bash
npm run build
```

Build output is generated in `dist/`.

---

## Telegram Mini App Setup (Quick)

1. Create a bot via [@BotFather](https://t.me/botfather).
2. Configure the Web App URL (deployed site or local tunnel URL).
3. Open the bot and launch the mini app.
4. For pure portfolio usage, keep offline-first mode enabled.

---

## Scripts

- `npm run dev` - start Vite dev server.
- `npm run build` - TypeScript check + production build.
- `npm run preview` - preview production build locally.
- `npm run typecheck` - strict TypeScript checks.
- `npm run test` - unit tests (Vitest).
- `npm run test:e2e` - end-to-end tests (Playwright).
- `npm run lint` - ESLint.

---

## Notes

- `dist/` should be regenerated after UI/code changes before deployment.
- Offline mode is ideal for demos, portfolio reviews, and no-backend showcases.
- Supabase is optional here and not required for core UX demonstration.

---

## License

MIT
