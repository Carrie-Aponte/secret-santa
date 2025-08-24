# Vercel Deployment Guide

## Prerequisites
1. A Supabase project with the database tables set up (see `DATABASE_SETUP.md`)
2. A Vercel account

## Environment Variables Setup

### 1. Get Supabase Credentials
- Go to your Supabase project dashboard
- Navigate to Settings → API
- Copy the "Project URL" and "anon public" key

### 2. Configure Vercel Environment Variables
In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: Make sure to set these for all environments (Production, Preview, Development)

### 3. Deploy
```bash
# Connect your repo to Vercel (if not already done)
vercel

# Or deploy from Git (recommended)
# Push your code to GitHub and connect the repo in Vercel dashboard
```

## Troubleshooting

### Build Error: "supabaseUrl is required"
This means the environment variables are not properly set in Vercel:
1. Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
2. Make sure they're set for the "Production" environment
3. Redeploy after adding the variables

### App works locally but not in production
1. Verify environment variables are set in Vercel
2. Check the Vercel deployment logs for errors
3. Make sure your Supabase project allows connections from your domain

## Local Development
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials
3. Run `npm run dev`

## Database Fallback
The app will fall back to localStorage if Supabase is not configured, but this means data won't sync across devices.
