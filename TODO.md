# TODO - Future Features

## Billing & Subscription Management

**Priority**: Phase 2

**Requirements**:
- Create `/billing` or `/settings/billing` page
- Integrate Stripe for payment processing
- Display current plan (Free, Starter, Pro, Agency)
- Show tier limits and usage for each resource type
- Upgrade/downgrade plan functionality
- Billing history and invoices
- Cancel subscription flow

**Upgrade Link Locations** (currently placeholder `#` links):
- Keywords page: "You've reached your keyword limit. Upgrade to add more keywords."
  - File: `src/components/keywords/keywords-page-client.tsx:65`
- Future similar messages for:
  - Projects limit (1 for free tier)
  - AI checks limit (1/month for free tier)
  - Content generation limit (1/month for free tier)

**Implementation Notes**:
- All tier limits defined in `src/lib/utils/tier-limits.ts`
- Update all placeholder `#` upgrade links to point to `/billing` page
- Consider upgrade CTAs in dashboard when user is at >80% of any limit
- Email notifications when limits are reached

---

## Automatic Rank Checking (Scheduled Jobs)

**Priority**: Phase 2 (after DataForSEO integration in Days 14-17)

**Requirements**:
- Implement Vercel Cron Jobs for scheduled rank checks
- Schedule based on tier:
  - Free: Manual only (current implementation)
  - Starter: Weekly (Monday 6am UTC)
  - Pro: Daily (6am UTC)
  - Agency: Daily (6am UTC)
- Email notifications for significant rank changes (±5 positions)

**Implementation Notes**:
- Use Vercel Cron Jobs (defined in `vercel.json`)
- Create `/api/cron/rank-checks` endpoint
- Batch process keywords in groups of 10-20 to respect API limits
- Store results in `rank_checks` table
- Calculate rank changes and send notifications

---

## Phase 1 MVP Completion

**Remaining Days**:
- Days 14-17: Traditional Rank Tracking (DataForSEO integration)
- Days 18-21: AI Search Tracking (ChatGPT, Claude, Perplexity, Gemini)
- Days 22-25: Content Generation (AI-powered blog posts)
- Days 26-30: Polish & Testing

**Current Status**: Days 11-13 Complete ✅
