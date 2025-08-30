# H2Ledger - Green Hydrogen Credits Platform

A production-ready frontend for trading, monitoring, and verifying green hydrogen sustainability credits.

## Project Structure

### Folders

- **components/** — Reusable UI components styled with Tailwind CSS and shadcn/ui for consistent design system implementation.
- **context/** — React context providers for global state management including authentication with JWT handling and theme management.
- **layouts/** — Shared layout components including navigation bars, sidebars, and protected route wrappers for authenticated areas.
- **pages/** — Route-level view components representing different screens like dashboard, credits marketplace, and audit portal.
- **services/** — API client using Axios for backend communication, JWT token management, and service modules for data fetching.
- **styles/** — Global CSS files and Tailwind configuration overrides for custom styling and theme variables.
- **utils/** — Utility functions for token storage, validation helpers, formatting functions, and other shared logic.

### Key Files

- **App.tsx** — Root component defining application routes using React Router and global layout structure.
- **main.tsx** — Application entry point that mounts the React app with necessary providers and configuration.
- **index.css** — Global styles including Tailwind directives and CSS custom properties for theming.

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui for styling
- React Router for navigation
- Recharts for data visualization
- Axios for API communication
- Lucide React for icons

## Features

- NFT/Tokenized credits marketplace
- Real-time analytics dashboard
- Regulatory audit portal
- JWT-based authentication
- Responsive design