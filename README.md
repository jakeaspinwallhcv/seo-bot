# AI SEO Platform - Track Rankings in Traditional & AI Search

Multi-tenant SaaS application that helps businesses track their rankings in both traditional search engines (Google) and AI search platforms (ChatGPT, Claude, Perplexity, Gemini), with AI-powered content generation.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works for development)
- API keys for external services (see Environment Variables below)

### Setup

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd seo-bot
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual API keys
   ```

3. **Run database migrations**

   You need to run the database migrations on Supabase. See [MIGRATIONS.md](./MIGRATIONS.md) for detailed instructions.

   **Quick start**:
   - Go to your Supabase project → SQL Editor
   - Run the migration: `supabase/migrations/20260105010000_add_serp_features.sql`
   - This adds columns needed for rank tracking (url, title, serp_features)

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:3000

## Phase 1 MVP: In Progress ⚙️

**Current Status:** AI Search Tracking Complete (Days 18-21 ✅)

**What's Working:**
- ✅ Next.js 14 with TypeScript and Tailwind CSS
- ✅ Supabase authentication (signup, login, email verification)
- ✅ Protected routes with middleware
- ✅ Database schema with RLS policies
- ✅ **5-step onboarding wizard with validation**
- ✅ **Tier limit enforcement (free tier: 1 project, 5 keywords)**
- ✅ **Automated testing infrastructure (Jest + React Testing Library)**
- ✅ **Security measures (input validation, XSS prevention, RLS)**
- ✅ **Dashboard with real data from Supabase**
- ✅ **Stats cards (projects, keywords, avg rank, AI citation rate)**
- ✅ **Recharts integration for rank trend visualization**
- ✅ **Activity feed with recent project/keyword/AI check events**
- ✅ **Responsive design with empty states for new users**
- ✅ **Keywords page with full table view**
- ✅ **Edit, delete, and add keyword functionality**
- ✅ **DataForSEO API integration for real Google rank checking**
- ✅ **Rank history tracking with modal view**
- ✅ **SERP features extraction (Featured Snippet, PAA, Local Pack, etc.)**
- ✅ **Rank change indicators with historical comparison**
- ✅ **Fallback to simulated data when API not configured**
- ✅ **Bulk rank checking (check all keywords at once)**
- ✅ **Toast notifications with Sonner library**
- ✅ **AI Search Tracking page with keyword-by-keyword checks**
- ✅ **Claude and ChatGPT integration for citation detection**
- ✅ **AI search results modal with full response history**
- ✅ **Citation rate calculation and status badges**
- ✅ **Platform-specific query generation and analysis**

**Next Steps (Days 22-30):**
- ✍️ Content Generation (Days 22-25)
- 🎨 Polish & Testing (Days 26-30)

## Tech Stack

**Frontend & Backend:**
- Next.js 14+ (App Router, Server Actions)
- TypeScript
- Tailwind CSS
- shadcn/ui components

**Database & Auth:**
- Supabase (PostgreSQL + Auth)
- Row-Level Security (RLS)

**External APIs:**
- Anthropic Claude (AI search + content generation)
- OpenAI (ChatGPT AI search)
- DataForSEO (traditional rank tracking)
- Resend (email notifications)

**Deployment:**
- Vercel (hosting)
- Vercel Edge Functions
- Vercel Cron Jobs

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npm run type-check

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Environment Variables

See `.env.example` for all required environment variables. Key services:

- **Supabase:** Database and authentication ([get started](https://supabase.com))
- **Anthropic:** Claude API for AI search and content ([console](https://console.anthropic.com))
- **OpenAI:** ChatGPT API for AI search ([platform](https://platform.openai.com))
- **DataForSEO:** Traditional rank tracking ([signup](https://dataforseo.com))
- **Resend:** Email notifications ([website](https://resend.com))

## Project Structure

```
seo-bot/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── (onboarding)/      # Onboarding flow
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utility functions
│   │   ├── supabase/          # Supabase clients
│   │   ├── api/               # External API clients
│   │   └── utils/             # Helper functions
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Auth middleware
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
├── .env.local                 # Environment variables (gitignored)
├── .env.example               # Environment template
└── package.json
```

## Phase 1 MVP Features

### Core Features (Free Tier)
- **Authentication:** Email/password signup with verification
- **Onboarding:** 5-step wizard to set up first project
- **Keywords:** Track up to 5 keywords
- **Traditional SEO:** Manual Google rank checks via DataForSEO
- **AI Search:** Manual checks on Claude + ChatGPT (1/month)
- **Content Generation:** Blog post generation with Claude (1/month)
- **Dashboard:** Stats cards, rank charts, activity feed

### Coming in Phase 2+
- Stripe payment integration
- Paid tiers (Starter, Pro, Agency)
- Automated rank checks
- Perplexity and Gemini AI search
- Competitor tracking
- Advanced analytics

## Development Roadmap

See the [implementation plan](.claude/plans/inherited-gathering-melody.md) for the complete 30-day roadmap.

## License

Proprietary
