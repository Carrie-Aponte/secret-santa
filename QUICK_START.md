# 🚀 Quick Start - Database Setup

## What I've Done
I've upgraded your secret santa app to use **Supabase** - a free PostgreSQL database that will sync across all devices!

## Files Added/Modified:
- `lib/supabase.ts` - Database connection
- `lib/database.ts` - Database service functions  
- `.env.local` - Environment variables (you need to fill this)
- `supabase-migration.sql` - Database table creation script
- `DATABASE_SETUP.md` - Detailed setup instructions

## Next Steps (Takes 5 minutes):

### 1. Create Supabase Account
- Go to https://supabase.com
- Sign up (free)
- Create new project

### 2. Get Your Keys
- In Supabase dashboard: Settings → API
- Copy Project URL and anon key

### 3. Update `.env.local`
Replace the placeholder values with your real Supabase credentials

### 4. Create Database Table
- Supabase dashboard: SQL Editor
- Copy/paste contents of `supabase-migration.sql`
- Click Run

### 5. Test!
- Restart: `npm run dev`
- Complete assignments on one device
- Open on another device - data syncs! 🎉

## Benefits:
✅ **Works across phones, tablets, computers**
✅ **Real-time syncing**
✅ **Free tier is perfect for this app**
✅ **Backup: still saves locally too**
✅ **Professional-grade database**

Your family can now use the app from any device and everyone will see the same data! Perfect for the holiday season! 🎄
