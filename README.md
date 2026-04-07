# BillFlow

[![CI](https://github.com/yourusername/billflow/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/billflow/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E.svg)](https://supabase.io/)

A production-grade Telegram Mini App for subscription and recurring expenses tracking.

## Overview

BillFlow helps users track their subscriptions and recurring payments, providing insights into monthly/yearly spending, upcoming renewals, and spending analytics by category.

### Key Features

- **Subscription Management**: Add, edit, and manage all your recurring payments
- **Dashboard Overview**: Quick view of total monthly/yearly spending
- **Upcoming Renewals**: See what's coming up in the next 30 days
- **Category Analytics**: Track spending by category with visual charts
- **Telegram Integration**: Seamless Mini App experience with Telegram auth
- **Smart Reminders**: Get notified before payments are due

## Tech Stack

- **Frontend**: React 18 + TypeScript 5 + Vite
- **Styling**: Tailwind CSS + class-variance-authority
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Charts**: Recharts
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components (Button, Card, etc.)
│   │   ├── layout/       # Layout components (Header, BottomNav)
│   │   └── loading/      # Loading states
│   ├── features/
│   │   ├── dashboard/    # Dashboard screen
│   │   ├── subscriptions/# Subscription list & form
│   │   └── analytics/    # Analytics screen with charts
│   ├── hooks/
│   │   ├── useTelegram.ts     # Telegram WebApp integration
│   │   ├── useSubscriptions.ts # Subscription CRUD
│   │   └── useDashboard.ts     # Dashboard stats
│   ├── lib/
│   │   ├── supabase.ts   # Supabase client
│   │   ├── database.types.ts   # Generated types
│   │   └── utils.ts      # Utility functions
│   ├── types/
│   │   └── index.ts      # TypeScript types
│   └── test/
│       └── setup.ts      # Test setup
├── supabase/
│   ├── migrations/       # Database migrations
│   ├── functions/        # Edge functions
│   └── config.toml       # Supabase config
├── e2e/                  # Playwright E2E tests
├── .github/workflows/    # CI/CD pipelines
└── docs/                 # Documentation

```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Telegram Bot (for Mini App)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/billflow.git
cd billflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BOT_TOKEN=your_telegram_bot_token
```

4. Set up Supabase:
```bash
# Run migrations in Supabase SQL Editor
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_telegram_auth.sql
supabase/migrations/003_cron_jobs.sql

# Deploy edge functions
supabase functions deploy telegram-auth
supabase functions deploy send-reminders
```

5. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Setting up Telegram Mini App

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Enable Web App for your bot
3. Set the Web App URL to your deployed app (or use ngrok for local development)
4. Get the bot token and add it to your `.env` file

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

## Architecture Highlights

### Frontend

- **Component Architecture**: Feature-based organization with shared UI components
- **State Management**: Server state with TanStack Query, local UI state with React hooks
- **Form Handling**: React Hook Form with Zod for type-safe validation
- **Styling**: Tailwind with custom design system using CSS variables

### Backend

- **Database**: PostgreSQL with Row Level Security for data isolation
- **Authentication**: Telegram Mini App initData validation
- **Edge Functions**: Serverless functions for auth and notifications
- **Cron Jobs**: Automated subscription date advancement

### Security

- Row Level Security (RLS) on all tables
- Telegram data validation with HMAC
- Input validation with Zod schemas
- Type-safe database queries

## Testing

### Unit Tests (Vitest)

```bash
npm test
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm test -- --coverage
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Build

```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

Built with modern technologies for a seamless subscription tracking experience.
