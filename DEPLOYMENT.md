# Deployment Guide

This document provides comprehensive instructions for deploying the full-stack application to staging and production environments.

## Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Vercel    │ ───────▶│   Railway   │ ───────▶│  Supabase   │
│  (Frontend) │         │  (Backend)  │         │  (Database) │
└─────────────┘         └─────────────┘         └─────────────┘
```

## Environments

- **Staging**: Automatically deployed on push to `main` branch
- **Production**: Deployed on release tags or manual workflow dispatch

## Prerequisites

1. GitHub account with repository access
2. Vercel account (free tier works)
3. Railway account (free tier works)
4. Supabase account (free tier works)
5. Node.js 20+ installed locally

## Initial Setup

### 1. Supabase Projects

Create two Supabase projects (staging and production):

1. Go to https://supabase.com/dashboard
2. Create a new project for **staging**:
   - Name: `tries-staging`
   - Database password: Generate a strong password
   - Region: Choose closest to your users
3. Create a new project for **production**:
   - Name: `tries-production`
   - Database password: Generate a strong password
   - Region: Same as staging

#### Run Migrations

For each project:

```bash
cd backend

npx supabase login

npx supabase link --project-ref YOUR_PROJECT_REF

npx supabase db push
```

#### Get Credentials

For each project, navigate to Settings > API:
- Copy `Project URL` (SUPABASE_URL)
- Copy `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

### 2. Railway Setup

1. Go to https://railway.app
2. Create a new project
3. Create two services:
   - **backend-staging**: Link to GitHub repo, `backend` directory
   - **backend-production**: Link to GitHub repo, `backend` directory

#### Configure Environment Variables

For **backend-staging**:
```
SUPABASE_URL=<staging_url>
SUPABASE_SERVICE_ROLE_KEY=<staging_key>
NODE_ENV=staging
PORT=3000
```

For **backend-production**:
```
SUPABASE_URL=<production_url>
SUPABASE_SERVICE_ROLE_KEY=<production_key>
NODE_ENV=production
PORT=3000
```

#### Configure Supabase Auth

In Supabase dashboard for each project:

1. Go to Authentication > URL Configuration
2. Add Railway URLs to:
   - Site URL: `https://your-backend-staging.railway.app`
   - Redirect URLs: Add both Railway and Vercel URLs

#### Get Railway Token

1. Go to Railway Account Settings
2. Generate a new API token
3. Save for GitHub Secrets

### 3. Vercel Setup

1. Go to https://vercel.com
2. Import your GitHub repository
3. Create two projects:
   - **tries-staging**: Set root directory to `frontend`
   - **tries-production**: Set root directory to `frontend`

#### Configure Environment Variables

For **tries-staging**:
```
VITE_API_BASE_URL=https://your-backend-staging.railway.app/api/helpers
```

For **tries-production**:
```
VITE_API_BASE_URL=https://your-backend-production.railway.app/api/helpers
```

#### Get Vercel Credentials

1. Go to Account Settings > Tokens
2. Create a new token
3. Get Organization ID from Settings > General
4. Get Project IDs from each project's Settings > General

### 4. GitHub Secrets

Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

#### Supabase Secrets (for CI tests)
```
SUPABASE_URL=<staging_or_test_url>
SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

#### Vercel Secrets
```
VERCEL_TOKEN=<your_vercel_token>
VERCEL_ORG_ID=<your_org_id>
VERCEL_PROJECT_ID_STAGING=<staging_project_id>
VERCEL_PROJECT_ID_PRODUCTION=<production_project_id>
```

#### Railway Secrets
```
RAILWAY_TOKEN=<your_railway_token>
```

## Deployment Process

### Automated Deployments

#### Staging Deployment
1. Push changes to `main` branch
2. GitHub Actions runs CI tests
3. If tests pass, deploys to staging automatically
4. Verify at staging URLs

#### Production Deployment
1. Create a new release tag:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```
2. GitHub Actions runs full test suite
3. If tests pass, deploys to production
4. Verify at production URLs

### Manual Deployments

#### Manual Production Deploy
1. Go to GitHub Actions
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select branch and confirm

#### Manual Railway Deploy (Backend)
```bash
npm install -g @railway/cli

railway login

cd backend
railway up --service backend-staging
```

#### Manual Vercel Deploy (Frontend)
```bash
npm install -g vercel

cd frontend
vercel --prod
```

## Health Checks

### Backend Health Check
```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 12345.67,
  "environment": "production"
}
```

### Frontend Health Check
Visit the frontend URL in a browser. The app should load without errors.

## Monitoring

### Railway
- View logs in Railway dashboard
- Monitor resource usage
- Check deployment history

### Vercel
- View deployment logs in Vercel dashboard
- Monitor build times and errors
- Check analytics (if enabled)

### Supabase
- View database logs in Supabase dashboard
- Monitor auth activity
- Check API usage

## Troubleshooting

### Common Issues

#### Backend not connecting to Supabase
1. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
2. Check Supabase project is active
3. Verify network connectivity from Railway

#### Frontend not connecting to backend
1. Verify VITE_API_BASE_URL is set correctly
2. Check CORS is enabled on backend
3. Verify Railway backend is running

#### CORS errors
1. Verify frontend URL is allowed in backend CORS config
2. Check Railway and Vercel URLs match environment variables
3. Update Supabase redirect URLs

#### Database migrations not applied
1. Manually run migrations via Supabase CLI
2. Verify migration files are committed to git
3. Check Supabase project ref is correct

### Getting Help

1. Check Railway logs for backend errors
2. Check Vercel logs for frontend errors
3. Check Supabase logs for database errors
4. Review GitHub Actions logs for CI/CD issues

## Rollback Procedure

### Backend Rollback (Railway)
1. Go to Railway deployment history
2. Select previous successful deployment
3. Click "Redeploy"

### Frontend Rollback (Vercel)
1. Go to Vercel deployments
2. Find previous successful deployment
3. Click "Promote to Production"

### Database Rollback (Supabase)
⚠️ Database rollbacks require manual migration reversal. Always test migrations in staging first!

## Security Considerations

1. Never commit `.env` files to git
2. Rotate secrets regularly
3. Use environment-specific credentials
4. Enable 2FA on all platform accounts
5. Review and update dependencies regularly
6. Monitor logs for suspicious activity

## Cost Estimates

### Free Tier Limits
- **Vercel**: 100 GB bandwidth/month
- **Railway**: 500 hours/month ($5 credit)
- **Supabase**: 500 MB database, 2 GB bandwidth

### Paid Tiers
- **Vercel Pro**: $20/month
- **Railway**: Pay as you go ($0.000231/GB-hour)
- **Supabase Pro**: $25/month

## Maintenance

### Weekly
- Review error logs
- Check service health
- Monitor resource usage

### Monthly
- Update dependencies
- Review and rotate secrets
- Analyze usage patterns

### Quarterly
- Review infrastructure costs
- Evaluate alternative platforms
- Update deployment documentation
