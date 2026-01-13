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

---

## Code Quality Standards

### Always Check Before Implementation

When working on this codebase, **ALWAYS**:

1. **Review `plan.md`** first - Check for known issues and current priorities
2. **Run type checking** - `npm run type-check` before committing frontend changes
3. **Run linting** - `npm run lint` and fix all warnings
4. **Check for duplicated code** - Extract reusable patterns into utilities or hooks
5. **Verify database schema** - Ensure all columns used in code exist in schema
6. **Consider performance** - Avoid N+1 queries, use proper indexes
7. **Update plan.md** - Document new issues discovered during development

### Code Patterns to Follow

**DO:**
- ✅ Use TypeScript strict mode (avoid `any` types)
- ✅ Validate all user input with Zod schemas
- ✅ Use `router.refresh()` for data invalidation (not `window.location.reload()`)
- ✅ Extract repeated logic into custom hooks or utility functions
- ✅ Use `next/image` for images (not `<img>` tags)
- ✅ Implement proper loading and error states
- ✅ Add ARIA labels for accessibility
- ✅ Use database transactions for multi-step operations
- ✅ Check for private IPs in user-provided URLs
- ✅ Set timeouts on regex operations and external API calls

**DON'T:**
- ❌ Use `any` types (use `unknown` and type guards instead)
- ❌ Skip input validation on API endpoints
- ❌ Reload entire page after mutations
- ❌ Store sensitive data in localStorage/sessionStorage
- ❌ Use raw SQL queries (use ORM only)
- ❌ Hard-code configuration values
- ❌ Allow users to delete system defaults
- ❌ Trust user input in regex patterns without validation
- ❌ Fetch URLs without checking for SSRF vulnerabilities
- ❌ Fire-and-forget async operations without error handling

---

## Testing Requirements

### Before Merging ANY Code

All new features MUST include:

1. **Unit Tests** - Test individual functions and utilities
2. **Integration Tests** - Test API endpoints with database
3. **Security Tests** - Verify authorization and input validation
4. **Type Safety** - No TypeScript errors or warnings

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test src/lib/utils/__tests__/tier-limits.test.ts

# Watch mode during development
npm test -- --watch
```

### Test Coverage Targets

- **Utilities**: 100% coverage required
- **API Endpoints**: 80% coverage minimum
- **Components**: 60% coverage minimum
- **Integration Tests**: Cover all critical workflows

### What to Test

**Always test:**
- Authentication & authorization
- Input validation & error handling
- RLS policy enforcement
- Boundary conditions (empty arrays, null values, max limits)
- Error paths (API failures, timeouts, invalid input)
- Race conditions (concurrent operations)

---

## Security Best Practices

### CRITICAL Security Checks

**Before deploying ANY feature, verify:**

1. **Authentication** - All API routes check `getUser()` (not just `getSession()`)
2. **Authorization** - Verify user owns resources before operations
3. **Input Validation** - Use Zod schemas, reject malformed data
4. **RLS Policies** - Database enforces access control
5. **SSRF Protection** - Block private IPs in user-provided URLs
6. **Injection Prevention** - Escape user input in AI prompts
7. **Rate Limiting** - Expensive operations have per-user limits
8. **Timeout Protection** - All external calls have timeouts
9. **Regex Safety** - User-provided patterns validated and limited
10. **Transaction Safety** - Critical operations use database transactions

### Security Vulnerabilities to Avoid

**High Risk:**
- SSRF - Never fetch user-provided URLs without IP validation
- SQL Injection - Never use raw SQL with user input
- Regex DoS - Timeout and validate all user-provided patterns
- Race Conditions - Use database constraints for concurrency control
- Prompt Injection - Escape user input in AI prompts

**Medium Risk:**
- XSS - Sanitize HTML in user-generated content
- CSRF - Validate tokens on state-changing operations
- Mass Assignment - Only allow whitelisted fields in updates
- Authorization Bypass - Check ownership on every resource access

### Reporting Security Issues

If you discover a security vulnerability:
1. Update `plan.md` with details and severity
2. Mark as 🔴 CRITICAL if exploitable
3. Propose a fix with code examples
4. Prioritize in "Immediate" action items

---

## Database Migration Guidelines

### Before Creating a Migration

1. **Check existing schema** - Read all migrations to understand current structure
2. **Verify column usage** - Grep codebase for any references to changed columns
3. **Check constraints** - Ensure CHECK constraints match application logic
4. **Plan rollback** - All migrations must be reversible
5. **Test with data** - Run migration on copy of production data

### Migration Checklist

- [ ] Migration adds all columns used in application code
- [ ] CHECK constraints match application validation
- [ ] Foreign keys have proper ON DELETE behavior
- [ ] Indexes exist for all frequently queried columns
- [ ] RLS policies cover all operations (SELECT, INSERT, UPDATE, DELETE)
- [ ] Default values are sensible and match application expectations
- [ ] Migration can be rolled back without data loss
- [ ] Migration tested on staging environment

### Common Migration Issues

**Avoid:**
- Adding columns without defaults on tables with data
- Changing CHECK constraints without updating application code
- Missing RLS policies (table becomes inaccessible)
- Dropping columns still referenced in code
- Creating indexes without CONCURRENTLY on large tables

---

## Before Production Deployment

### Pre-Deployment Checklist

**MUST complete before deploying:**

- [ ] All tests passing (`npm test`)
- [ ] Type checking clean (`npm run type-check`)
- [ ] Linting clean (`npm run lint`)
- [ ] No console.log statements in production code
- [ ] All critical issues from `plan.md` resolved
- [ ] Database migrations tested on staging
- [ ] Environment variables configured correctly
- [ ] Rate limiting enabled on expensive endpoints
- [ ] Error tracking configured (Sentry or similar)
- [ ] Monitoring alerts set up for critical paths
- [ ] Backup strategy tested and documented

### Production Readiness Criteria

**Security:**
- [ ] All API endpoints require authentication
- [ ] RLS policies enforce data isolation
- [ ] Input validation on all user-facing endpoints
- [ ] SSRF protection on URL crawling
- [ ] Rate limiting on expensive operations
- [ ] Secrets stored in environment variables (never committed)

**Performance:**
- [ ] Database indexes exist for common queries
- [ ] N+1 queries eliminated or acceptable
- [ ] Large tables have pagination
- [ ] Static assets optimized and cached
- [ ] API response times < 200ms (p95)

**Reliability:**
- [ ] Background jobs have retry logic
- [ ] Database operations use transactions where needed
- [ ] Error handling for all external API calls
- [ ] Graceful degradation for optional features
- [ ] Monitoring and alerting configured

**Testing:**
- [ ] Critical paths have integration tests
- [ ] Security tests cover authentication/authorization
- [ ] Load testing completed for expected traffic
- [ ] Staging environment mirrors production

---

## Development Workflow

### Starting a New Feature

1. **Read `plan.md`** - Check for related issues or dependencies
2. **Create a branch** - `feature/description` or `fix/issue-name`
3. **Write tests first** - TDD approach for critical functionality
4. **Implement feature** - Follow code quality standards above
5. **Run all checks** - Tests, types, linting
6. **Update `plan.md`** - Document any new issues discovered
7. **Create PR** - Include testing notes and migration instructions

### Code Review Requirements

**Reviewer must verify:**
- [ ] Tests included and passing
- [ ] Security considerations addressed
- [ ] Performance implications considered
- [ ] Database schema matches code expectations
- [ ] Documentation updated if needed
- [ ] No hard-coded values or secrets
- [ ] Error handling is comprehensive
- [ ] Type safety maintained (no `any` types)

### Emergency Hotfixes

For production issues:
1. Create `hotfix/description` branch
2. Fix the immediate issue with minimal changes
3. Add test to prevent regression
4. Update `plan.md` with root cause analysis
5. Fast-track review and deployment
6. Schedule proper fix in next sprint

---

## Monitoring & Observability

### Key Metrics to Track

**Application:**
- API response times (p50, p95, p99)
- Error rates by endpoint
- Background job success rates
- Database query performance
- Active user sessions

**Business:**
- Analyses completed per day
- Content generated per day
- API costs (Claude, DataForSEO, OpenAI)
- User sign-ups and churn
- Feature usage by tier

**Infrastructure:**
- Database connection pool usage
- Memory usage per service
- CPU utilization
- Disk space remaining
- External API availability

### Alerting Thresholds

**Immediate alerts (PagerDuty):**
- Error rate > 5% for > 5 minutes
- API response time > 1s (p95) for > 5 minutes
- Background job success rate < 90%
- Database connection pool > 80% utilized

**Warning alerts (Email):**
- Daily API costs exceed budget by 20%
- Disk space < 20% remaining
- Memory usage > 80% for > 15 minutes
- Unusual traffic patterns detected

---

## Cost Management

### Controlling AI API Costs

**Monitor:**
- Per-user API usage (store in `api_usage` table)
- Daily cost trends
- Expensive operations (content generation, AI search)

**Optimize:**
- Use prompt caching aggressively (30% savings)
- Implement usage-based rate limiting per tier
- Cache AI search results (24-hour TTL)
- Batch operations where possible

**Prevent Abuse:**
- Rate limit content generation (10/day for free tier)
- Rate limit analyses (5/day for free tier)
- Monitor for suspicious usage patterns
- Implement cost alerts at $100/day threshold

---

## Getting Help

### When You're Stuck

1. **Check `plan.md`** - Issue might be documented with solution
2. **Review related code** - Look for similar patterns in codebase
3. **Check test files** - Tests often show intended usage
4. **Read migration files** - Understand database schema evolution
5. **Consult CLAUDE.md** - This file has architecture details

### Useful Commands

```bash
# Find where a function is used
grep -r "functionName" src/

# Find all API endpoints
find src/app/api -name "route.ts"

# Check database schema
cat supabase/migrations/*.sql | grep "CREATE TABLE"

# Find TypeScript errors
npm run type-check

# Run specific test
npm test -- --testPathPattern="pattern"
```

---

## Summary

**This file is your contract with the codebase.**

Every change should:
1. ✅ Maintain or improve code quality
2. ✅ Include appropriate tests
3. ✅ Consider security implications
4. ✅ Update `plan.md` with issues found
5. ✅ Follow established patterns

**Before every commit:** Run tests, check types, lint code.
**Before every deployment:** Complete pre-deployment checklist.
**After discovering issues:** Update `plan.md` immediately.

Quality and security are not optional - they're requirements.
