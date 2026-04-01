# Ledger Bloom - Personal Finance Dashboard

A React + Vite dashboard for tracking personal income and expenses with charts, filters, exports, and role-based editing.

## Features

- Summary cards for opening balance, income, expenses, and net position
- Balance trend chart and spending breakdown chart (Recharts)
- Search, filter, sort, group, and paginate transactions
- Export visible transactions as CSV or JSON
- Role switcher:
  - Viewer: read-only mode
  - Admin: add, edit, delete, and delete-all actions
- Local mock API simulation with loading/sync states
- Theme toggle (light/dark)

## Tech Stack

- React 19
- Vite 8
- Recharts 3
- ESLint 9

## Getting Started

### Prerequisites

- Node.js 20+ (recommended)

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Then open the local URL shown by Vite (typically `http://localhost:5173`).

## Available Scripts

- `npm run dev` - Start local dev server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Data and Persistence

- Seed transactions are defined in `src/data/transactions.js`.
- Runtime data is persisted in browser local storage via a mock API layer.
- Local storage keys:
  - `finance-dashboard-transactions`
  - `finance-dashboard-role`
  - `finance-dashboard-theme`

To reset data, clear local storage for the app in your browser and reload.

## Project Structure

```text
src/
	components/    UI blocks (header, charts, table, modal)
	context/       Finance state, reducer, filtering logic
	data/          Seed data, category palette, defaults
	services/      Mock API (fetch/save with simulated latency)
	utils/         Analytics, export helpers, formatting helpers
```
