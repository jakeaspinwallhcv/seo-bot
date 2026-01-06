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

**Priority**: Phase 2 (Paid Tier Feature)

**Current Implementation (Phase 1)** ✅:
- Manual rank checking (single keyword)
- Bulk rank checking ("Check All Ranks" button)
- DataForSEO API integration
- SERP features extraction
- Rank history tracking with modal view

**Planned for Phase 2**:
- Implement Vercel Cron Jobs for automated scheduled rank checks
- Schedule based on tier:
  - **Free**: Manual only (current implementation - no automation)
  - **Starter**: Weekly automatic checks (Monday 6am UTC)
  - **Pro**: Daily automatic checks (6am UTC)
  - **Agency**: Daily automatic checks (6am UTC)
- Email notifications for significant rank changes (±5 positions)

**Implementation Notes**:
- Use Vercel Cron Jobs (defined in `vercel.json`)
- Create `/api/cron/rank-checks` endpoint (reuse `/api/keywords/check-all` logic)
- Batch process keywords by user to respect API limits
- Store results in `rank_checks` table (already implemented)
- Calculate rank changes and send email notifications
- Respect tier limits (only check for users with active paid subscriptions)
- Consider rate limiting (e.g., 10 keywords per minute to avoid API throttling)

---

## Phase 1 MVP Completion

**Completed Days**:
- ✅ Days 1-7: Project Setup, Auth, Onboarding
- ✅ Days 8-10: Dashboard UI with Charts
- ✅ Days 11-13: Keyword Management
- ✅ Days 14-17: Traditional Rank Tracking (DataForSEO integration)

**Remaining Days**:
- Days 18-21: AI Search Tracking (ChatGPT, Claude, Perplexity, Gemini)
- Days 22-25: Content Generation (AI-powered blog posts)
- Days 26-30: Polish & Testing

**Current Status**: Days 14-17 Complete ✅
