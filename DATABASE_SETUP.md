# 🗄️ Database Setup Instructions

## Setting up Supabase for Cross-Device Persistence

### Step 1: Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project called "secret-santa" (or any name you prefer)

### Step 2: Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL**
   - **anon/public key**

### Step 3: Configure Environment Variables
1. Open the file `/home/carrie/Documents/repos/secret-santa/.env.local`
2. Replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

### Step 4: Create Database Table
1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-migration.sql`
3. Click **Run** to create the table

### Step 5: Test the Application
1. Restart your Next.js server: `npm run dev`
2. Visit http://localhost:3000
3. Complete some assignments
4. Open the app on a different device/browser - your data should sync!

## 🔄 How It Works Now

### Automatic Syncing
- **Save**: Every assignment automatically saves to Supabase
- **Load**: App loads from Supabase when you open it
- **Fallback**: If database fails, uses localStorage as backup
- **Cross-device**: Works on any device with internet access

### Data Flow
1. User makes assignment → Saves to Supabase + localStorage backup
2. New device opens app → Loads from Supabase
3. All devices stay in sync automatically

### Benefits
✅ **Cross-device sync**: Works on phone, tablet, computer
✅ **Real-time**: Changes appear on all devices
✅ **Backup**: localStorage fallback if database is down
✅ **Free**: Supabase free tier is generous
✅ **Secure**: Built-in authentication and security

## 🚨 Important Notes

1. **Internet Required**: Database sync needs internet connection
2. **Backup Strategy**: App saves to both database AND localStorage
3. **Reset Function**: Admin reset clears both database and local storage
4. **Family ID**: Uses unique ID "aponte-family-2024" to prevent conflicts

## 💰 Cost
- **Supabase Free Tier**: 
  - 2 databases
  - 500MB storage
  - 2GB bandwidth/month
  - More than enough for this app!

Your secret santa app now has professional-grade persistence! 🎄
