# WorkCore OS - Unified Operating System for SMEs

## Project Overview
WorkCore OS is a multi-tenant SaaS platform unifying Sales, Operations, Finance, Inventory, HR, and Communications for small & medium businesses.

## Tech Stack
- **Frontend Web**: React (Next.js patterns) + TailwindCSS
- **Mobile**: React Native + Expo (Planned)
- **Backend**: NestJS Microservices (Planned)
- **Database**: PostgreSQL + Redis
- **Infra**: Docker + Kubernetes

## Project Structure (Monorepo)
```
/apps
  /web          # Dashboard & Management Portal (Current)
  /mobile       # Offline-first Mobile App
/services
  /auth         # Authentication & User Management
  /sales        # Leads, Quotations, Invoices
  /finance      # Payments & Reconciliation
  /inventory    # Stock & Warehouses
  /hr           # Employee Management
  /comms        # WhatsApp & Email Integration
  /ai           # Gemini-powered Insights
```

## Getting Started
This skeleton demonstrates the **Web Frontend** architecture.
- `lib/api.ts`: Mock API layer simulating the BFF (Backend-for-Frontend).
- `services/geminiService.ts`: AI Integration.
- `pages/`: Modular feature pages.
