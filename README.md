# Aponte Family Secret Santa App

A specialized Secret Santa assignment app designed for our family, who have already drawn names but some members have forgotten their assignments. This app helps restore and complete the Secret Santa process without disrupting existing assignments.

## Problem Solved

The Aponte family already drew Secret Santa names for Christmas, but half the family forgot who they were assigned! Instead of starting over, this app allows:

1. **Family members who remember** their assignments to enter them first (removing those people from the available pool)
2. **Family members who forgot** to then get random assignments from the remaining available people
3. **Everyone** to look up their assignments later if they forget again

## Features

### Assignment Process
- **Smart Assignment Flow**: Handles both known and forgotten assignments
- **Duplicate Prevention**: Ensures no person is assigned to multiple family members
- **Privacy Protection**: Warning screens before revealing sensitive information
- **Cross-Device Sync**: Data persists across devices using Supabase
- **Offline Fallback**: Works with localStorage when database is unavailable

### Assignment Lookup
- **Secure Lookup**: Find your assignment with privacy warnings
- **Family Validation**: Only family members can access the system
- **Assignment History**: Track who has completed their assignments

### User Experience
- **Mobile-First Design**: Responsive interface for all devices
- **Button-Based Interface**: No typing required - just click names
- **Clear Instructions**: Step-by-step guidance through the process
- **Error Prevention**: Validation to prevent invalid assignments

## Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible components

### Backend & Database
- **[Supabase](https://supabase.com/)** - PostgreSQL database with real-time features
- **Edge Functions** - Serverless backend logic
- **Row Level Security** - Built-in data protection

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Turbopack](https://turbo.build/pack)** - Fast bundler for development
- **[PostCSS](https://postcss.org/)** - CSS processing

### Deployment
- **[Vercel](https://vercel.com/)** - Production hosting with automatic deployments
- **Environment Variables** - Secure configuration management

## Getting Started

### Prerequisites
- Node.js 20 or later
- npm or yarn
- Supabase account (for cross-device sync)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Carrie-Aponte/secret-santa.git
   cd secret-santa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Follow the instructions in `DATABASE_SETUP.md`
   - Run the SQL migration in `supabase-migration.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Use

### For the Aponte Family

#### Step 1: People Who Remember Go First
1. Click **"Start Assignment Process"**
2. Enter your name
3. Click **"Yes, I know"** (if you remember who you're buying for)
4. Select the person you're buying a gift for
5. Confirm your selection
6. That person is now removed from the available pool

#### Step 2: People Who Forgot Get Assignments
1. Click **"Start Assignment Process"**
2. Enter your name
3. Click **"No, I forgot"**
4. Click **"Generate"** to get a random assignment from remaining people
5. Privacy warning appears - click to reveal your assignment

#### Step 3: Look Up Assignments Later
1. Click **"Check My Assignment"**
2. Select your name
3. Privacy warning appears - click to reveal your assignment

### For Other Families

To customize for your family:
1. Edit `app/features/santa/constants.ts`
2. Update the `FAMILY_MEMBERS` array with your family names:
   ```typescript
   export const FAMILY_MEMBERS: string[] = [
     'Mom', 'Dad', 'Sister', 'Brother', 'Grandma', 'Grandpa'
   ];
   ```

## Project Structure

```
secret-santa/
├── app/                          # Next.js App Router
│   ├── assign_santas/           # Assignment flow page
│   ├── check-santa/             # Assignment lookup page
│   ├── features/santa/          # Core business logic
│   │   ├── constants.ts         # Family members list
│   │   ├── logic.ts            # Assignment algorithms
│   │   └── types.ts            # TypeScript definitions
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                  # Reusable UI components
│   ├── theme-provider.tsx      # Dark/light mode
│   └── ui/                     # shadcn/ui components
├── lib/                        # Utility libraries
│   ├── database.ts             # Supabase service
│   ├── shuffle.ts              # Random assignment logic
│   ├── supabase.ts             # Database client
│   └── utils.ts                # Helper functions
├── public/                     # Static assets
└── docs/                       # Documentation
    ├── DATABASE_SETUP.md       # Database setup guide
    ├── VERCEL_DEPLOYMENT.md    # Deployment instructions
    └── UI_IMPROVEMENTS.md      # Design decisions
```

## Privacy & Security

- **Privacy Warnings**: Users must explicitly click to reveal sensitive information
- **No Accidental Reveals**: Multiple confirmation steps prevent accidental exposure
- **Validation**: System prevents invalid assignments and duplicates
- **Secure Storage**: Data encrypted in transit and at rest with Supabase
- **Family-Only Access**: Name validation ensures only family members can use the app

## Configuration

### Family Members
Edit `app/features/santa/constants.ts` to customize family members.

### Database
The app uses Supabase with automatic fallback to localStorage. See `VERCEL_DEPLOYMENT.md` for setup instructions.

### Styling
Built with Tailwind CSS and shadcn/ui. Customize theme in `tailwind.config.js`.

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Google Cloud Platform

## Contributing

This is a family-specific app, but feel free to fork it for your own family's Secret Santa needs!


## Happy Holidays!

May your Secret Santa exchange be merry and bright!

---

*Built with ❤️ for the Aponte family Christmas 2025*
