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

3. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:3000

## Phase 1 MVP: In Progress ⚙️

**Current Status:** Authentication Complete (Days 3-5 ✅)

**What's Working:**
- ✅ Next.js 14 with TypeScript and Tailwind CSS
- ✅ Supabase authentication (signup, login, email verification)
- ✅ Protected routes with middleware
- ✅ Database schema with RLS policies
- ✅ User profiles auto-created on signup
- ✅ Dashboard and onboarding pages (placeholders)

**Next Steps (Days 6-30):**
- 🔄 Onboarding Wizard (Days 6-7)
- 📊 Dashboard UI with Charts (Days 8-10)
- 🔑 Keyword Management (Days 11-13)
- 📈 Traditional Rank Tracking (Days 14-17)
- 🤖 AI Search Tracking (Days 18-21)
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
