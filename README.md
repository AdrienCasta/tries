# Tries - Healthcare Helper Onboarding Platform

A full-stack application for onboarding healthcare professionals with credential verification and multi-step registration.

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite build tool
- Redux Toolkit for state management
- React Hook Form with Zod validation
- Tailwind CSS with Radix UI components
- Vitest for testing

### Backend
- Node.js with TypeScript
- Fastify web framework
- Supabase (PostgreSQL) for database
- bcryptjs for password hashing
- Vitest for testing (unit, integration, e2e)

### Infrastructure
- Frontend: Vercel
- Backend: Railway
- Database: Supabase (hosted)
- CI/CD: GitHub Actions

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     Vercel      │ ───────▶│     Railway     │ ───────▶│    Supabase     │
│   (Frontend)    │         │    (Backend)    │         │   (Database)    │
│                 │         │                 │         │                 │
│  - React SPA    │         │  - Fastify API  │         │  - PostgreSQL   │
│  - Static Host  │         │  - REST APIs    │         │  - Auth         │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase CLI (for database management)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tries
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:

   **Backend** (create `backend/.env`):
   ```bash
   cp backend/.env.example backend/.env
   ```

   Fill in Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PORT=3000
   NODE_ENV=development
   ```

   **Frontend** (create `frontend/.env`):
   ```bash
   cp frontend/.env.example frontend/.env
   ```

   Set backend URL:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api/helpers
   ```

4. Set up database:
   ```bash
   cd backend
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

### Running Locally

Start both frontend and backend:

```bash
npm run start:backend     # Terminal 1
cd frontend && npm run dev # Terminal 2
```

Access the application:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health check: http://localhost:3000/health

### Running Tests

```bash
npm test                  # All tests
npm run test:frontend     # Frontend tests only
npm run test:backend      # Backend tests only
```

Backend-specific tests:
```bash
cd backend
npm run test:unit         # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e          # End-to-end tests
```

## Project Structure

```
tries/
├── frontend/
│   ├── src/
│   │   ├── features/          # Feature modules
│   │   │   ├── register-helper/
│   │   │   └── shared/
│   │   ├── components/        # UI components
│   │   ├── store/             # Redux store
│   │   └── App.tsx
│   ├── .env.example
│   └── vercel.json
│
├── backend/
│   ├── src/
│   │   ├── features/          # Feature modules
│   │   ├── infrastructure/    # Framework adapters
│   │   ├── shared/            # Shared domain logic
│   │   └── index.ts
│   ├── supabase/
│   │   ├── migrations/        # Database migrations
│   │   └── seed.sql
│   ├── .env.example
│   └── railway.toml
│
├── .github/
│   └── workflows/             # CI/CD workflows
└── DEPLOYMENT.md              # Deployment guide
```

## Features

- Healthcare professional registration
- Multi-step form with validation
- Profession selection (14+ healthcare roles)
- Credential verification (RPPS/ADELI)
- Place of birth with country grouping
- French residence area selection
- Email confirmation flow
- Secure password handling

## Deployment

### Quick Deploy

#### Staging (automatic)
Push to `main` branch:
```bash
git push origin main
```

#### Production (manual)
Create a release:
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### Full Deployment Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup instructions including:
- Platform configuration (Vercel, Railway, Supabase)
- Environment setup for staging and production
- GitHub secrets configuration
- Troubleshooting guide

## Environment Variables

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api/helpers` |

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | `eyJ...` |
| `PORT` | Server port (optional) | `3000` |
| `NODE_ENV` | Environment | `development` |

## API Endpoints

### Backend API

```
POST   /api/helpers/register              # Register new helper
GET    /api/helpers/confirm-email         # Confirm email
GET    /health                             # Health check
```

## Database Schema

### Tables
- `helpers` - Healthcare professional profiles
- `professions` - Available healthcare professions
- `helper_professions` - Helper-profession relationships

See `backend/supabase/migrations/` for complete schema.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Create Pull Request

### Code Style
- Follow existing patterns
- Write tests for new features
- Update documentation

## License

[Add license information]

## Support

For issues and questions:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Review GitHub issues for known problems
- Contact the development team