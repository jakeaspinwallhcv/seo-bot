# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-tenant SaaS application that helps real estate agents optimize their websites for both traditional search engines (Google, Bing) and modern AI chatbots (ChatGPT, Claude, Perplexity, Gemini). The system automatically analyzes websites daily, generates SEO-optimized content weekly, tracks keyword rankings, monitors backlinks, analyzes competitors, and surfaces improvement opportunities.

**Tech Stack:**
- Backend: FastAPI (Python) + Celery + PostgreSQL + Redis
- Frontend: React + TypeScript + Vite + Shadcn/ui + Tailwind CSS
- AI: Anthropic Claude (analysis & content generation)
- Deployment: Render.com

## Common Commands

### Local Development

```bash
# Start all services (API, workers, database, Redis)
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f worker

# Stop all services
docker-compose down

# Rebuild containers after dependency changes
docker-compose up -d --build
```

### Backend Development

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run FastAPI dev server (with hot reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run single test file
pytest tests/test_analysis_service.py -v

# Run all tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1

# Celery worker (local testing)
celery -A app.workers.celery_app worker --loglevel=info

# Celery Beat scheduler (local testing)
celery -A app.workers.celery_app beat --loglevel=info

# Monitor Celery with Flower
celery -A app.workers.celery_app flower --port=5555
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run dev server (hot reload on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Type check
npm run type-check
```

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (React + TypeScript)               │
│              Shadcn/ui + Tailwind CSS + Recharts             │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Application                        │
│   Auth | Website Analysis | Content Gen | Metrics           │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              Celery Workers (Background Jobs)                │
│   Daily Analysis | Weekly Content Gen | Metrics Collection  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌───────────────┬──────────────┬──────────────┬──────────────┐
│  PostgreSQL   │    Redis     │ Anthropic    │     S3       │
│   (Data)      │ (Queue/Cache)│ Claude API   │  (Storage)   │
└───────────────┴──────────────┴──────────────┴──────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    External Integrations                     │
│  Google Search Console | Google Analytics | SEO APIs        │
│  (Rankings & CTR)      | (Traffic Data)   | (Backlinks)     │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Tenancy Architecture

**Critical**: Every database table has a `tenant_id` column. All queries must be filtered by tenant context.

- JWT tokens include `tenant_id` claim
- Middleware (`app/middleware/tenant_context.py`) sets tenant context per request
- Application-level query filtering prevents cross-tenant data access
- Database-level constraints enforce tenant isolation

**Security pattern:**
```python
# All queries automatically filtered by tenant
current_user = get_current_user(token)
tenant_id = current_user.tenant_id

# SQLAlchemy models inherit TenantMixin
websites = db.query(Website).filter(Website.tenant_id == tenant_id).all()
```

### Background Job System

**Celery + Redis** handles all async operations:

1. **Daily Tasks** (`app/workers/tasks/analysis_tasks.py`):
   - Website crawling & SEO analysis
   - Keyword rankings fetch (Google Search Console)
   - Traffic metrics collection (Google Analytics)

2. **Weekly Tasks** (`app/workers/tasks/content_tasks.py`):
   - AI-powered content generation
   - Backlink & competitor analysis
   - Email notifications for pending approvals

3. **Scheduling** (`app/workers/scheduler.py`):
   - Celery Beat configuration
   - Per-website schedules stored in `automation_schedules` table

**Pattern:**
```python
# Tasks are defined in workers/tasks/
@celery_app.task(bind=True, max_retries=3)
def analyze_website_task(self, website_id: int, tenant_id: int):
    # Task implementation
    pass

# Scheduled in scheduler.py
celery_app.conf.beat_schedule = {
    'daily-analysis': {
        'task': 'app.workers.tasks.analysis_tasks.run_daily_analyses',
        'schedule': crontab(hour=2, minute=0),  # 2 AM daily
    },
}
```

### Web Crawling Strategy

**Stack**: Playwright (JavaScript-enabled) + BeautifulSoup4 (parsing) + Trafilatura (text extraction)

- Max 50 pages per website (configurable in `crawler_service.py`)
- 30-second timeout per page
- 1 req/sec rate limit (respect robots.txt)
- Headless browser for JavaScript-heavy sites

**Critical files:**
- `app/services/crawler_service.py` - Orchestrates crawling
- `app/analyzers/technical_analyzer.py` - Technical SEO checks
- `app/analyzers/content_analyzer.py` - Content quality analysis
- `app/analyzers/mobile_analyzer.py` - Mobile optimization
- `app/analyzers/ai_chatbot_analyzer.py` - AI chatbot optimization

### SEO Scoring System

**Formula (0-100 scale):**
```
Overall Score = (Technical × 0.30) + (Content × 0.35) +
                (Mobile × 0.20) + (AI Chatbot × 0.15)

Technical (30%):    Meta tags, load times, broken links, HTTPS, canonical tags
Content (35%):      Word count, readability, keyword usage, heading structure
Mobile (20%):       Responsive design, mobile performance scores
AI Chatbot (15%):   Schema.org markup, FAQ format, clear answers
```

Implemented in `app/analyzers/scoring_engine.py`.

### AI Integration Pattern

**Anthropic Claude** powers analysis and content generation.

```python
# SEO Analysis - lower temperature for consistency
response = await anthropic.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=4096,
    temperature=0.3,
    messages=[{"role": "user", "content": analysis_prompt}]
)

# Content Generation - higher temperature for creativity
response = await anthropic.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=8192,
    temperature=0.7,
    messages=[{"role": "user", "content": content_prompt}]
)
```

**Cost Optimization:**
- Use prompt caching for repeated context (30-50% savings)
- Track usage per tenant in `api_usage` table
- Rate limiting prevents runaway costs (~$0.05-0.15 per analysis)

**Critical file:** `app/services/ai_service.py`

### Content Generation Workflow

```
Generate (AI) → Pending Approval → Approved/Rejected → Published
```

- All content requires agent approval before publishing
- Email notifications sent when new content ready
- Built-in editor for modifications (`frontend/src/components/content/ContentEditor.tsx`)
- Version control tracked in `content_items` table

### Google Integrations (OAuth Flow)

**Search Console & Analytics** use OAuth 2.0:

1. User clicks "Connect Google Search Console"
2. Redirect to Google OAuth consent screen
3. User authorizes access to GSC/GA data
4. Exchange authorization code for tokens
5. Store encrypted refresh tokens in `integrations` table
6. Background jobs use refresh tokens to fetch data daily

**Implementation:**
- `google-auth-oauthlib` library
- Automatic token refresh when expired
- Per-user OAuth (each agent connects their own accounts)
- `app/services/gsc_service.py` - Google Search Console API
- `app/services/analytics_service.py` - Google Analytics API

### Database Schema

**Core multi-tenant structure:**
```
tenants (organizations/agencies)
  ├── users (real estate agents)
  ├── websites (agent websites to monitor)
  │     ├── website_analyses (SEO analysis results)
  │     │     └── crawled_pages (individual page data)
  │     ├── content_items (generated content)
  │     ├── seo_metrics (time-series tracking)
  │     ├── keyword_rankings (GSC keyword position data)
  │     ├── backlinks (backlink profile data)
  │     ├── competitors (competitor tracking)
  │     ├── analytics_data (Google Analytics metrics)
  │     ├── integrations (OAuth tokens for GSC/GA)
  │     └── automation_schedules (daily/weekly jobs)
  ├── job_executions (audit trail)
  └── api_usage (cost monitoring)
```

**Time-series optimization:**
- Use table partitioning for `seo_metrics` and `keyword_rankings`
- Daily snapshots enable historical trend analysis

## Project Structure

```
seo-bot/
├── backend/
│   ├── app/
│   │   ├── main.py                      # FastAPI app entry
│   │   ├── config.py                    # Configuration
│   │   ├── api/v1/                      # API endpoints
│   │   │   ├── auth.py                  # Authentication
│   │   │   ├── websites.py              # Website management
│   │   │   ├── analyses.py              # Analysis results
│   │   │   ├── content.py               # Content generation
│   │   │   └── metrics.py               # Metrics & dashboards
│   │   ├── models/                      # SQLAlchemy models
│   │   ├── schemas/                     # Pydantic schemas
│   │   ├── services/
│   │   │   ├── crawler_service.py       # Web crawling (Playwright)
│   │   │   ├── analysis_service.py      # SEO analysis orchestration
│   │   │   ├── ai_service.py            # Claude API integration
│   │   │   ├── content_service.py       # Content generation
│   │   │   ├── gsc_service.py           # Google Search Console API
│   │   │   ├── analytics_service.py     # Google Analytics API
│   │   │   ├── seo_api_service.py       # Ahrefs/SEMrush/Moz integration
│   │   │   └── competitor_service.py    # Competitor tracking
│   │   ├── analyzers/
│   │   │   ├── technical_analyzer.py    # Technical SEO checks
│   │   │   ├── content_analyzer.py      # Content quality
│   │   │   ├── mobile_analyzer.py       # Mobile optimization
│   │   │   ├── ai_chatbot_analyzer.py   # AI chatbot optimization
│   │   │   └── scoring_engine.py        # Score calculation
│   │   ├── workers/
│   │   │   ├── celery_app.py            # Celery config
│   │   │   ├── tasks/
│   │   │   │   ├── analysis_tasks.py    # Daily analysis jobs
│   │   │   │   ├── content_tasks.py     # Weekly content gen
│   │   │   │   └── metrics_tasks.py     # Metrics collection
│   │   │   └── scheduler.py             # Celery Beat schedule
│   │   ├── core/
│   │   │   └── security.py              # JWT auth, multi-tenancy
│   │   └── middleware/
│   │       └── tenant_context.py        # Tenant isolation
│   ├── alembic/                         # DB migrations
│   ├── Dockerfile                       # API container
│   ├── Dockerfile.worker                # Worker container
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx            # Main dashboard
│   │   │   ├── Websites.tsx             # Website list
│   │   │   ├── Analysis.tsx             # Analysis details
│   │   │   └── Content.tsx              # Content approval queue
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── ScoreGauge.tsx       # Score visualization
│   │   │   │   └── TrendChart.tsx       # Metrics charts
│   │   │   ├── analysis/
│   │   │   │   └── AnalysisReport.tsx   # Analysis display
│   │   │   └── content/
│   │   │       └── ContentEditor.tsx    # Content editing
│   │   └── services/
│   │       └── api.ts                   # API client
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml                   # Local development
└── render.yaml                          # Production deployment
```

## Environment Variables

```bash
# Core Application
SECRET_KEY=<jwt-secret-key>
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# AI Provider
ANTHROPIC_API_KEY=<your-claude-api-key>

# Google APIs (OAuth credentials)
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
GOOGLE_REDIRECT_URI=https://yourapp.com/api/v1/auth/google/callback

# SEO API (choose one)
SEMRUSH_API_KEY=<semrush-api-key>
# OR
AHREFS_API_KEY=<ahrefs-api-key>
# OR
MOZ_ACCESS_ID=<moz-access-id>
MOZ_SECRET_KEY=<moz-secret-key>

# Optional: For chatbot visibility testing
OPENAI_API_KEY=<openai-api-key>
GEMINI_API_KEY=<google-gemini-api-key>

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<email>
SMTP_PASSWORD=<app-password>
```

## AI Chatbot Optimization

**Why it matters:** AI chatbots (ChatGPT, Claude, Gemini, Perplexity) are becoming primary search tools. Optimization differs from traditional SEO.

**Key factors analyzed:**
1. **Structured Data**: Schema.org markup (RealEstateAgent, LocalBusiness, FAQPage)
2. **FAQ Format**: Q&A structure that chatbots can extract
3. **Clear Hierarchy**: Proper H1 → H6 heading structure
4. **Authoritative Content**: Credentials, local expertise, data/statistics
5. **Natural Language**: Conversational tone, answers common questions
6. **Entity Recognition**: Clear mentions of locations, services, specialties

**Analyzer:** `app/analyzers/ai_chatbot_analyzer.py`

## Security Considerations

1. **Authentication**: JWT tokens with 24-hour expiration
2. **Password Hashing**: bcrypt with high cost factor
3. **Rate Limiting**: 100 req/min per user, 10 req/min for analysis endpoints
4. **Input Validation**: All API inputs validated via Pydantic schemas
5. **CORS**: Restricted to frontend domain only in production
6. **HTTPS Only**: Force HTTPS redirects in production
7. **SQL Injection**: SQLAlchemy ORM only (no raw SQL queries)
8. **Secrets Management**: Environment variables, never commit API keys

## Performance Targets

- API response time < 200ms (p95)
- Website analysis completion < 5 minutes for 50-page site
- Background job success rate > 95%
- System uptime > 99.5%

## Cost Estimates (100 customers)

**AI API Costs (Claude):**
- Daily analysis: $150-450/month
- Weekly content generation: $40-100/month
- Total: ~$200-550/month

**Infrastructure (Render):**
- Web + Worker + PostgreSQL + Redis: ~$30-100/month

**SEO API (SEMrush):**
- ~$200/month for API access
