# Product Requirements Document: AI SEO Platform

**Version:** 1.0  
**Date:** January 4, 2026  
**Author:** Jake Aspinwall  
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Personas](#2-user-personas)
3. [Core Features (MVP)](#3-core-features-mvp)
4. [Technical Architecture](#4-technical-architecture)
5. [User Flows](#5-user-flows)
6. [UI/UX Requirements](#6-uiux-requirements)
7. [Pricing & Monetization](#7-pricing--monetization)
8. [MVP Scope & Phases](#8-mvp-scope--phases)
9. [Success Metrics](#9-success-metrics)
10. [Out of Scope for MVP](#10-out-of-scope-for-mvp)
11. [Technical Considerations](#11-technical-considerations)
12. [Go-to-Market Strategy](#12-go-to-market-strategy)
13. [Open Questions](#13-open-questions--decisions-needed)
14. [Appendix](#14-appendix-example-api-calls)

---

## 1. Executive Summary

### Product Vision

An AI-powered SEO platform that helps businesses rank in both traditional search engines (Google, Bing) and AI search platforms (ChatGPT, Claude, Perplexity, Gemini), with automated content generation and competitive intelligence.

### Problem Statement

Businesses are losing visibility as users shift from traditional search engines to AI chatbots for information discovery. Current SEO tools don't track or optimize for AI search citations, leaving businesses blind to this emerging channel. Additionally, existing enterprise SEO tools are too expensive and complex for small businesses and solopreneurs.

### Solution

A comprehensive, affordable SEO platform that:
- Tracks rankings across traditional search engines
- Monitors citations in AI search results (ChatGPT, Claude, Perplexity, Gemini)
- Generates SEO-optimized content using AI
- Provides competitor intelligence
- Automates reporting and insights

### Target Market

- Small to medium businesses
- Solopreneurs and content creators
- Digital marketing agencies
- Industry focus: Real estate, local services, professional services

### Business Model

Freemium SaaS with tiered monthly subscriptions:
- **Free:** $0/month (lead generation)
- **Starter:** $29/month
- **Pro:** $99/month
- **Agency:** $299/month

### Success Criteria

- Launch MVP in 12-14 weeks
- Achieve 100 free signups in first month
- 5% free-to-paid conversion rate
- <5% monthly churn
- Validate product-market fit for potential acquisition/sale

---

## 2. User Personas

### Primary Persona: Sarah - Solo Real Estate Agent

**Demographics:**
- Age: 35-50
- Location: Suburban/mid-size markets
- Self-employed, 5-10 years experience
- Income: $75K-150K/year

**Technical Proficiency:**
- Comfortable with basic tools (CRM, social media)
- Limited technical/SEO expertise
- Willing to learn if interface is intuitive

**Pain Points:**
- Doesn't know if content appears in AI search results
- Can't afford enterprise SEO tools ($300-500/month)
- Lacks time and expertise for manual SEO work
- Needs consistent content but can't afford writers
- Competes against larger brokerages with marketing teams

**Goals:**
- Attract out-of-market buyers through search visibility
- Rank for local + specialty keywords (e.g., "waterfront homes")
- Generate leads without cold calling
- Build personal brand and authority

**Jobs to be Done:**
- Monitor search rankings for key properties/areas
- Understand competitive landscape
- Create blog content consistently
- Prove ROI on marketing efforts

**Budget:** $29-99/month

**Quote:** *"I know SEO matters, but I don't have time to figure it all out. I just need to know: Am I showing up when people search? And how do I fix it if I'm not?"*

---

### Secondary Persona: Mike - Small Agency Owner

**Demographics:**
- Age: 30-45
- Location: Urban markets
- Runs 2-10 person digital marketing agency
- Manages 5-15 clients
- Income: $150K-300K/year

**Technical Proficiency:**
- Strong digital marketing knowledge
- Understands SEO principles
- Comfortable with APIs and integrations
- Needs tools that scale across clients

**Pain Points:**
- Managing SEO for multiple clients is time-consuming
- Clients asking about AI search visibility (new challenge)
- Needs white-label reporting for professional presentation
- Content creation bottleneck across clients
- Current tools either too expensive or too limited

**Goals:**
- Scale operations without hiring more people
- Retain clients with comprehensive reporting
- Differentiate with AI search capabilities
- Increase margins by automating repetitive work
- Provide modern solutions clients can't get elsewhere

**Jobs to be Done:**
- Track multiple client projects in one platform
- Generate reports clients can understand
- Identify content opportunities across portfolio
- Prove value to retain clients

**Budget:** $299+/month (bills to clients)

**Quote:** *"I need tools that make me look like a hero to my clients. If I can show them they're appearing in ChatGPT results before their competitors even know that's a thing, I'm the expert they need."*

---

### Tertiary Persona: Jessica - Content Creator/Blogger

**Demographics:**
- Age: 25-40
- Location: Anywhere (remote)
- Full-time blogger or content creator
- Monetizes through ads, affiliates, sponsored content
- Income: $50K-100K/year

**Technical Proficiency:**
- Very comfortable with digital tools
- Understands SEO and content strategy
- Data-driven decision maker
- Early adopter of new platforms

**Pain Points:**
- Traffic declining as users shift to AI search
- Doesn't know what content ranks in AI results
- Needs to optimize existing library of content
- Competition increasing in every niche
- Ad revenue depends on traffic

**Goals:**
- Maintain/grow organic traffic
- Understand which content formats AI prefers
- Optimize content for maximum visibility
- Stay ahead of algorithm changes (traditional + AI)

**Jobs to be Done:**
- Track content performance across channels
- Identify content gaps and opportunities
- Optimize existing content for AI search
- Monitor competitive content strategies

**Budget:** $29-99/month

**Quote:** *"I have 300+ articles published. Which ones show up in AI searches? Which ones don't? I need to know so I can optimize what's working and fix what's not."*

---

## 3. Core Features (MVP)

### 3.1 Authentication & Onboarding

**Requirements:**

**Authentication:**
- Email/password signup and login via Supabase Auth
- Email verification required before accessing platform
- Password reset flow with secure token
- Session management with auto-refresh
- Optional OAuth (Google) for faster signup

**Onboarding Flow:**

Multi-step guided onboarding (5 steps):

**Step 1: Account Creation**
- Collect: Email, full name, password
- Validate: Email format, password strength (8+ chars, 1 number, 1 special)
- Send verification email
- Auto-login after verification

**Step 2: Add First Website/Project**
- Input: Project name (e.g., "My Real Estate Business")
- Input: Domain name (e.g., "jakeaspinwall.com")
- Validate: Domain is valid and accessible (DNS check)
- Store: Create project in database

**Step 3: Add Initial Keywords**
- Guided prompt: "What keywords do you want to rank for?"
- Input: Text area for bulk paste or individual entry
- Suggestion: "Add 5-10 keywords to start" (based on tier)
- Examples shown: "best real estate agent in [city]", "[service] near me"
- Validation: Dedup keywords, trim whitespace
- Store: Save keywords linked to project

**Step 4: Add Competitors (Optional)**
- Prompt: "Who are your main competitors?" (can skip)
- Input: 1-3 competitor domains
- Validate: Domains are valid
- Store: Save competitor list

**Step 5: First AI Search Check**
- Prompt: "Let's see if you appear in AI search results"
- Action: Automatically trigger AI check on 2 keywords
- Loading: "Checking Claude and ChatGPT..." (5-10 seconds)
- Results: Show immediate results with visual indicators
- Celebration: "You're live! Here's your dashboard."

**Onboarding Complete:**
- Redirect to dashboard
- Show getting started checklist widget:
  - ✓ Added website
  - ✓ Added keywords
  - ✓ Ran first AI check
  - ☐ Generate your first content
  - ☐ Explore insights
  - ☐ Upgrade to unlock more features
- Display tour tooltips on first dashboard visit

**Technical Implementation:**
```typescript
// Supabase Auth setup
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    emailRedirectTo: `${location.origin}/auth/callback`,
  }
})

// Email verification
// Supabase sends email automatically
// User clicks link → redirects to /auth/callback → session established

// Protected routes middleware
export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return res
}
```

**Email Templates:**
- Welcome email after signup
- Email verification link
- Password reset email
- First AI check results summary

---

### 3.2 Dashboard (Home View)

**Purpose:** Central hub showing overview of all tracked metrics and quick access to key actions.

**Layout:**

**Header Section:**
- Logo (top left)
- Project selector dropdown (if multiple projects)
- Global search bar
- Notifications bell icon
- User avatar with dropdown menu (Profile, Settings, Billing, Logout)

**Stats Cards Section (4-column grid on desktop, stacked on mobile):**

1. **Total Keywords Card**
   - Number: Total keywords being tracked
   - Trend: +X from last period
   - Subtext: "X/Y limit used" (based on tier)
   - Click: Navigate to Keywords page

2. **Average Rank Card**
   - Number: Average position across all keywords
   - Trend: ↑↓ change from last check
   - Visual: Small sparkline chart
   - Color: Green if improving, red if declining
   - Click: Navigate to Keywords page with sort by rank

3. **AI Citation Rate Card**
   - Number: Percentage (e.g., "45%")
   - Subtext: "Cited in X of Y checks"
   - Breakdown: Icons for each platform with check/x
   - Trend: Change from last period
   - Click: Navigate to AI Search page

4. **Content Generated Card**
   - Number: Content pieces created this month
   - Subtext: "X/Y limit used"
   - Quick action: "Generate New" button
   - Click: Navigate to Content page

**Main Content Area:**

**Rank Trend Chart:**
- Title: "Ranking Performance (Last 30 Days)"
- Chart type: Area chart (Recharts)
- X-axis: Date
- Y-axis: Average rank (inverted scale, lower is better)
- Multiple lines: Overall average, best keyword, worst keyword
- Hover: Show exact rank on date
- Responsive: Simplify on mobile

**Recent Activity Feed:**
- Title: "Recent Activity"
- List of recent events:
  - "Rank improved: 'keyword' moved from #15 → #12"
  - "AI Check: Cited in Claude response for 'keyword'"
  - "Content generated: 'Blog post title'"
  - "Competitor rank changed: Competitor X moved up for 'keyword'"
- Show last 10 items
- Timestamps: "2 hours ago", "Yesterday"
- Click item: Navigate to relevant detail page

**Quick Actions Panel:**
- Large, prominent buttons:
  - "Add Keywords"
  - "Run AI Check"
  - "Generate Content"
  - "View Insights"
- Disabled states if tier limits reached (with upgrade CTA)

**Getting Started Checklist (for new users, dismissible):**
- Progress bar showing completion
- Checklist items with checkmarks
- Disappears after all items complete or dismissed

**Empty States:**
- If no keywords: Large illustration with "Add your first keyword to start tracking"
- If no data yet: "Your first rank check is running. Check back in 24 hours!"

**Technical Implementation:**
```typescript
// Dashboard data fetching
async function getDashboardData(userId: string, projectId: string) {
  const supabase = createClientComponentClient()
  
  // Fetch all data in parallel
  const [
    keywords,
    latestRanks,
    aiChecks,
    contentCount,
    recentActivity
  ] = await Promise.all([
    supabase
      .from('keywords')
      .select('*')
      .eq('project_id', projectId),
    
    supabase
      .from('rank_checks')
      .select('*, keyword:keywords(*)')
      .eq('keywords.project_id', projectId)
      .order('checked_at', { ascending: false })
      .limit(100),
    
    supabase
      .from('ai_search_checks')
      .select('*')
      .eq('project_id', projectId)
      .order('checked_at', { ascending: false })
      .limit(100),
    
    supabase
      .from('generated_content')
      .select('count')
      .eq('project_id', projectId)
      .gte('created_at', startOfMonth()),
    
    // Fetch recent activity (union of different events)
    fetchRecentActivity(projectId)
  ])
  
  // Calculate stats
  const avgRank = calculateAverageRank(latestRanks)
  const aiCitationRate = calculateCitationRate(aiChecks)
  const trends = calculateTrends(latestRanks)
  
  return {
    stats: {
      totalKeywords: keywords.data?.length || 0,
      avgRank,
      aiCitationRate,
      contentCount: contentCount.data?.[0]?.count || 0
    },
    trends,
    recentActivity
  }
}
```

**Performance Considerations:**
- Cache dashboard stats (5-minute TTL)
- Use React Query for data fetching with automatic background refetch
- Implement skeleton loaders while data loads
- Optimize database queries with proper indexes

---

### 3.3 Traditional SEO Tracking

#### 3.3.1 Keyword Rank Tracking

**Purpose:** Track and monitor keyword rankings in Google search results over time.

**Keyword Management:**

**Add Keyword Interface:**
- Modal or slide-over panel
- Fields:
  - Keyword (required): Text input
  - Target URL (optional): URL input, defaults to homepage
  - Tags (optional): Multi-select or comma-separated input
  - Search location (future): Defaults to "United States"
- Validation:
  - No duplicate keywords per project
  - Max keywords per tier enforced
  - Valid URL format if provided
- Actions:
  - "Add Keyword" button
  - "Add Another" to stay in modal
  - "Cancel"

**Bulk Import:**
- CSV upload or paste text area
- Format: One keyword per line or CSV (keyword, target_url, tags)
- Preview before import
- Show validation errors (dupes, invalid formats)
- Confirm count before importing

**Keywords List View:**

**Table Columns:**
1. Keyword (sortable)
2. Current Rank (sortable, color-coded)
   - Green: 1-10
   - Yellow: 11-20
   - Orange: 21-50
   - Red: 51+
   - Gray: Not ranking (>100)
3. Change (arrow icon + number)
4. Best Rank (all-time best)
5. Target URL
6. Search Volume (from API)
7. Difficulty Score (from API)
8. Tags
9. Last Checked (timestamp)
10. Actions (kebab menu: Edit, View history, Delete)

**Filters & Search:**
- Search bar: Filter by keyword text
- Rank filter: Dropdown (All, Top 10, 11-20, 21-50, 51+, Not ranking)
- Change filter: Dropdown (All, Improved, Declined, No change)
- Tag filter: Multi-select (show all used tags)
- Date filter: Last checked date range

**Sorting:**
- Click column headers to sort
- Default: Sort by rank (ascending)
- Remember user's sort preference

**Bulk Actions:**
- Checkbox select multiple keywords
- Actions: Delete, Add tag, Remove tag, Export

**Keyword Detail View:**

Clicking a keyword opens detail page/modal:

**Overview Section:**
- Keyword (large heading)
- Current rank (prominent)
- Target URL (clickable link)
- Tags (editable)

**Rank History Chart:**
- Line chart showing rank over time
- X-axis: Date
- Y-axis: Rank (inverted, lower is better)
- Hover: Show exact rank on date
- Zoom: Date range selector (7D, 30D, 90D, All)

**SERP Features Section:**
- Show SERP features captured (if available):
  - Featured snippet (yes/no)
  - People Also Ask
  - Local pack
  - Knowledge panel
  - etc.

**Ranking URL History:**
- Table showing which URLs ranked on which dates
- Useful if ranking URL changes over time

**Rank Check History Table:**
- Date, Rank, Change, SERP Features
- Paginated (show last 90 days by default)

**Actions:**
- "Edit Keyword" button
- "Delete Keyword" button (with confirmation)
- "Export Data" button (CSV of history)
- "View SERP" link (opens Google search in new tab)

**Automatic Rank Checking:**

**Schedule (based on tier):**
- Free: Manual only (user clicks "Check Now")
- Starter: Weekly (every Monday 6am UTC)
- Pro: Daily (every day 6am UTC)
- Agency: Daily (every day 6am UTC)

**Rank Check Process:**
1. Cron job triggers at scheduled time
2. Fetch all keywords for eligible users (based on tier)
3. Queue rank check jobs (batch in groups of 10-20 to respect API limits)
4. For each keyword:
   - Call DataForSEO API with keyword + location
   - Parse SERP results to find user's domain
   - Extract rank position (1-100, or null if not found)
   - Extract SERP features
   - Store result in `rank_checks` table
5. Calculate rank changes (compare to previous check)
6. Send notifications if significant change (±5 positions)

**API Integration (DataForSEO):**
```typescript
// DataForSEO rank check
interface RankCheckRequest {
  keyword: string
  location_name: string
  language_code: string
  device: 'desktop' | 'mobile'
  os?: string
}

async function checkKeywordRank(
  keyword: string,
  targetDomain: string
): Promise<RankCheckResult> {
  const response = await fetch(
    'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`
        ).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        keyword,
        location_name: 'United States',
        language_code: 'en',
        device: 'desktop',
        os: 'windows'
      }])
    }
  )
  
  const data = await response.json()
  
  // Parse SERP results
  const items = data.tasks[0].result[0].items
  
  // Find user's domain in results
  const userResult = items.find((item: any) => 
    item.url?.includes(targetDomain)
  )
  
  const rank = userResult ? userResult.rank_absolute : null
  const url = userResult?.url
  
  // Extract SERP features
  const serpFeatures = {
    featuredSnippet: items.some((i: any) => i.type === 'featured_snippet'),
    peopleAlsoAsk: items.some((i: any) => i.type === 'people_also_ask'),
    localPack: items.some((i: any) => i.type === 'local_pack'),
  }
  
  return {
    rank,
    url,
    serpFeatures,
    searchVolume: data.tasks[0].result[0].keyword_data?.keyword_info?.search_volume,
    difficulty: data.tasks[0].result[0].keyword_data?.keyword_properties?.keyword_difficulty
  }
}
```

**Notifications:**

Email notification sent when:
- Rank improves by 5+ positions
- Rank declines by 5+ positions
- Keyword enters top 10
- Keyword falls out of top 10

Email content:
- Subject: "🎉 Your keyword 'X' improved to position Y" (or appropriate message)
- Body: Summary of change with link to view details
- Option to manage notification preferences

**Database Schema Reminder:**
```sql
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  target_url TEXT,
  search_volume INT,
  difficulty_score INT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, keyword)
);

CREATE TABLE rank_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  rank INT, -- null if not ranking in top 100
  url TEXT, -- actual ranking URL
  search_engine TEXT DEFAULT 'google',
  location TEXT DEFAULT 'us',
  serp_features JSONB,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rank_checks_keyword_date 
  ON rank_checks(keyword_id, checked_at DESC);
```

**Performance Optimization:**
- Index on (keyword_id, checked_at) for fast history queries
- Cache recent rank data (1 hour TTL)
- Pagination for large keyword lists
- Virtual scrolling for 100+ keywords

---

#### 3.3.2 Competitor Tracking

**Purpose:** Monitor competitor rankings for your tracked keywords and identify opportunities.

**Competitor Management:**

**Add Competitor:**
- Input: Competitor domain (e.g., "competitorsite.com")
- Optional: Competitor name/label (defaults to domain)
- Validation: Domain is valid and accessible
- Action: Add to project

**Competitors List:**
- Card-based view or table
- Each competitor shows:
  - Name/domain
  - Domain authority (if available from API)
  - Number of overlapping keywords
  - Average rank across your keywords
  - Actions: Edit, Delete

**Competitor Comparison View:**

**Table Layout:**
- Rows: Your tracked keywords
- Columns: You, Competitor 1, Competitor 2, Competitor 3...
- Cell content: Rank position (color-coded)
- Empty cell if competitor doesn't rank

**Example:**
```
Keyword                          | You | Competitor A | Competitor B
-----------------------------------------------------------------
best real estate agent           | 12  | 3            | 45
luxury waterfront homes          | 8   | -            | 15
seattle metro real estate        | 23  | 18           | 7
```

**Visual Indicators:**
- You rank higher: Green highlight
- Competitor ranks higher: Red highlight
- Similar rank (±3): Yellow
- Not ranking: Gray dash

**Sorting & Filtering:**
- Sort by: Your rank, competitor rank, difference
- Filter: Show only keywords where competitor ranks higher
- Filter: Show only keywords where you don't rank but competitor does

**Keyword Gap Analysis:**

**Purpose:** Discover keywords competitors rank for that you don't track.

**Implementation (Future):**
- API call to get competitor's top ranking keywords
- Compare against your keyword list
- Show opportunities: Keywords they rank for (especially top 20) that you don't track
- Ability to add these keywords to your tracking

**For MVP:** Manual - suggest users can add competitor keywords manually if they know them.

**Competitor Detail View:**

Click competitor to see:

**Overview:**
- Domain/name
- Domain metrics (authority, backlinks, etc. from API)
- Total keywords tracked (your keywords they rank for)
- Average rank

**Ranking Performance:**
- Table of all your keywords with their ranks
- Sort by their rank
- Filter to show only keywords where they outrank you
- Identify patterns (do they dominate certain topics?)

**Rank Changes:**
- Show competitor rank changes over time
- Chart comparing your rank vs their rank over time for a keyword

**Automatic Competitor Rank Checks:**

**Schedule:** Same as your rank checks (based on tier)

**Process:**
- When checking your keywords, also check competitor ranks
- Store in separate `competitor_ranks` table
- Link to both competitor and keyword

**API Call:**
- Same DataForSEO call as your rank check
- Just search for competitor's domain instead of yours
- Parse and store their position

**Database Schema:**
```sql
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  name TEXT,
  domain_authority INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, domain)
);

CREATE TABLE competitor_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  rank INT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitor_ranks_lookup 
  ON competitor_ranks(competitor_id, keyword_id, checked_at DESC);
```

**Insights Generated:**

- "Competitor X ranks higher than you on 8 of 15 keywords"
- "Your biggest ranking gaps: [list keywords where they're top 10 and you're not]"
- "Keywords you're winning: [list keywords where you outrank them]"
- "Competitor Y moved up on 3 keywords this week"

**UI Components:**
- Comparison table with sortable columns
- Visual gap analysis chart (bar chart showing you vs competitors)
- Opportunity cards highlighting keywords to focus on

---

### 3.4 AI Search Tracking

**Purpose:** Monitor if and how often your website appears in AI-powered search results across Claude, ChatGPT, Perplexity, and Gemini.

**Overview:**

This is the differentiating feature. Most SEO tools don't track AI search visibility. This feature:
- Queries AI platforms with your tracked keywords
- Checks if your domain is cited in responses
- Tracks citation trends over time
- Helps optimize content for AI search

**AI Search Dashboard:**

**Header Stats:**
- Overall citation rate: "45% of checks resulted in citation"
- Best performing platform: "Perplexity cites you most often"
- Trend: ↑↓ change from previous period

**Platform Breakdown (4 cards):**

For each platform (Claude, ChatGPT, Perplexity, Gemini):
- Platform logo/icon
- Citation rate for this platform
- Number of checks performed
- Last check date
- "View Details" link

**Keywords with AI Search Data:**

**Table View:**

Columns:
1. Keyword
2. Claude (✓ or ✗ icon, click to view response)
3. ChatGPT (✓ or ✗ icon)
4. Perplexity (✓ or ✗ icon)
5. Gemini (✓ or ✗ icon)
6. Citation Rate (% cited across all platforms)
7. Last Checked
8. Actions (Check now, View history)

**Visual Indicators:**
- ✓ Green: You were cited
- ✗ Red: You were not cited
- ○ Gray: Not checked yet
- ⏳ Yellow: Check in progress

**Filters:**
- Platform: All, Claude, ChatGPT, Perplexity, Gemini
- Citation status: All, Cited, Not cited, Not checked
- Last checked: Today, This week, This month, Custom range

**Citation Trend Chart:**
- Line chart showing citation rate over time
- X-axis: Date of checks
- Y-axis: Citation rate (%)
- Multiple lines for each platform
- Hover: Show exact rate and date

**Triggering AI Search Checks:**

**Manual Check:**
- User clicks "Run AI Check" button
- If single keyword: Check that keyword only
- If bulk: Select multiple keywords → "Check Selected" button
- Confirmation modal: "This will use X check credits. Continue?"
- Show loading state: "Checking 4 platforms..." (progress indicator)
- Show results immediately when complete

**Scheduled Checks (based on tier):**
- Free: 1 check per month (all keywords at once)
- Starter: 4 checks per month (weekly, all keywords)
- Pro: 30 checks per month (daily, rotate through keywords)
- Agency: Unlimited (daily for all keywords)

**Cron Job Process:**
1. Determine which users/keywords need checks (based on schedule)
2. Queue AI check jobs
3. For each keyword:
   - Construct query (see below)
   - Call each AI platform API
   - Parse response for domain mentions
   - Store results
4. Send summary notifications if significant changes

**Query Construction:**

Transform user's keyword into a natural query for AI:

**Examples:**
- Keyword: "best real estate agent bainbridge island"
- Query: "Who are the best real estate agents on Bainbridge Island? Please provide specific recommendations with websites."

- Keyword: "waterfront homes seattle"
- Query: "What are some good resources for finding waterfront homes in the Seattle area?"

**Query Templates (by keyword type):**

Informational:
- "What are the best [keyword]?"
- "Can you recommend [keyword]?"
- "Where can I find information about [keyword]?"

Transactional:
- "Where can I buy/find [keyword]?"
- "What are the best options for [keyword]?"

Local:
- "Who are the best [service] in [location]?"
- "Where can I find [service] near [location]?"

**Allow custom templates** (Pro/Agency tier):
- User can define their own query format
- Use variables like {keyword}, {location}, etc.

**AI Platform Integration:**

#### Claude (Anthropic API)
```typescript
async function checkClaude(
  query: string,
  targetDomain: string
): Promise<AISearchResult> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })
  
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: query
    }]
  })
  
  const response = message.content[0].text
  
  // Check if target domain is mentioned
  const isCited = response.toLowerCase().includes(targetDomain.toLowerCase())
  
  // Try to extract cited URL if mentioned
  let citedUrl = null
  if (isCited) {
    const urlMatch = response.match(new RegExp(`https?://[^\\s]*${targetDomain}[^\\s]*`, 'i'))
    citedUrl = urlMatch ? urlMatch[0] : targetDomain
  }
  
  // Try to determine position (rough)
  // Count how many domains are mentioned before yours
  const allDomains = response.match(/https?://[^\s]+/g) || []
  const position = isCited 
    ? allDomains.findIndex(url => url.includes(targetDomain)) + 1
    : null
  
  return {
    platform: 'claude',
    query,
    response,
    isCited,
    citedUrl,
    position,
    totalSources: allDomains.length,
    checkedAt: new Date()
  }
}
```

#### ChatGPT (OpenAI API)
```typescript
async function checkChatGPT(
  query: string,
  targetDomain: string
): Promise<AISearchResult> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{
      role: 'user',
      content: query
    }],
    max_tokens: 1000
  })
  
  const response = completion.choices[0].message.content
  
  // Same parsing logic as Claude
  const isCited = response.toLowerCase().includes(targetDomain.toLowerCase())
  // ... rest of parsing
  
  return {
    platform: 'chatgpt',
    query,
    response,
    isCited,
    citedUrl,
    position,
    totalSources: allDomains.length,
    checkedAt: new Date()
  }
}
```

#### Perplexity API
```typescript
async function checkPerplexity(
  query: string,
  targetDomain: string
): Promise<AISearchResult> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{
        role: 'user',
        content: query
      }]
    })
  })
  
  const data = await response.json()
  const responseText = data.choices[0].message.content
  
  // Perplexity typically includes citations in structured format
  const citations = data.citations || []
  const isCited = citations.some((c: any) => c.url?.includes(targetDomain))
  
  return {
    platform: 'perplexity',
    query,
    response: responseText,
    isCited,
    citedUrl: citations.find((c: any) => c.url?.includes(targetDomain))?.url,
    position: citations.findIndex((c: any) => c.url?.includes(targetDomain)) + 1,
    totalSources: citations.length,
    checkedAt: new Date()
  }
}
```

#### Google Gemini API
```typescript
async function checkGemini(
  query: string,
  targetDomain: string
): Promise<AISearchResult> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  
  const result = await model.generateContent(query)
  const response = result.response.text()
  
  // Same parsing logic
  const isCited = response.toLowerCase().includes(targetDomain.toLowerCase())
  // ...
  
  return {
    platform: 'gemini',
    query,
    response,
    isCited,
    citedUrl,
    position,
    totalSources,
    checkedAt: new Date()
  }
}
```

**Batch Checking Function:**
```typescript
async function performAISearchCheck(
  keywordId: string,
  keyword: string,
  targetDomain: string,
  projectId: string
): Promise<void> {
  // Construct query
  const query = constructQuery(keyword)
  
  // Check all platforms in parallel
  const results = await Promise.all([
    checkClaude(query, targetDomain),
    checkChatGPT(query, targetDomain),
    checkPerplexity(query, targetDomain),
    checkGemini(query, targetDomain)
  ])
  
  // Store all results
  for (const result of results) {
    await supabase
      .from('ai_search_checks')
      .insert({
        project_id: projectId,
        keyword_id: keywordId,
        platform: result.platform,
        query: result.query,
        response: result.response,
        is_cited: result.isCited,
        cited_url: result.citedUrl,
        position: result.position,
        total_sources: result.totalSources,
        checked_at: result.checkedAt
      })
  }
  
  // Update usage tracking
  await trackUsage(projectId, 'ai_check', 4) // 4 checks (one per platform)
}
```

**Response Detail View:**

When user clicks on a citation indicator (✓ or ✗):

**Modal opens showing:**

**Header:**
- Platform logo and name
- Date/time of check
- Citation status (large ✓ or ✗)

**Query Section:**
- "Query sent to [Platform]:"
- Display the exact query

**Response Section:**
- "Full response:"
- Show complete AI response
- Highlight your domain if cited (yellow background)
- Highlight your company name if mentioned

**Citation Details (if cited):**
- Cited URL: Link to the specific page mentioned
- Position: "You were the 3rd source cited out of 7 total sources"
- Context: Show the sentence(s) around your citation

**All Sources Mentioned:**
- List all domains/sources mentioned in response
- Yours highlighted
- Useful to see competition

**Actions:**
- "View Previous Checks" (see history)
- "Check Again Now"
- "Close"

**Historical Trend View:**

For a specific keyword, show:
- Timeline of all checks
- Platform-by-platform citation history
- Chart showing citation rate over time
- Notable changes (first citation, dropped citation)

**Database Schema:**
```sql
CREATE TABLE ai_search_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
  platform TEXT NOT NULL, -- claude, chatgpt, perplexity, gemini
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  is_cited BOOLEAN DEFAULT FALSE,
  cited_url TEXT,
  position INT, -- position among cited sources
  total_sources INT, -- total sources cited
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_checks_project_date 
  ON ai_search_checks(project_id, checked_at DESC);
  
CREATE INDEX idx_ai_checks_keyword_platform 
  ON ai_search_checks(keyword_id, platform, checked_at DESC);
```

**Usage & Rate Limiting:**

**Track usage per billing period:**
- Count checks per user per month
- Enforce tier limits
- Show usage counter: "4/4 checks used this month" (Starter)
- Disable "Check" buttons when limit reached
- Show upgrade CTA

**Cost Optimization:**
- Cache checks for 24 hours (don't re-check same keyword/platform in 24h)
- Batch checks where possible
- Use cheaper models when appropriate (Claude Haiku for quick checks?)
- Allow user to prioritize keywords (check important ones more often)

**Notifications:**

Email sent when:
- First citation ever: "🎉 You're appearing in AI search results!"
- Citation achieved on new platform
- Citation lost (was cited, now not cited in last 2 checks)
- Weekly summary: "You were cited in X% of AI searches this week"

**Insights:**

Automated insights generated:
- "Your citation rate improved from 30% to 45% this month"
- "Claude cites you most often (60% rate)"
- "These keywords get cited most: [list]"
- "Your article [URL] is cited in 5 different AI responses"
- "Opportunity: You're not cited for 'keyword X' - competitor Y is"

---

### 3.5 Content Generation

**Purpose:** AI-powered content creation optimized for both traditional SEO and AI search citation.

**Content Types Supported (MVP):**

1. **Blog Posts** (500-2000 words)
2. **Meta Descriptions** (150-160 chars)
3. **Title Tags** (50-60 chars)
4. **FAQ Sections** (5-10 Q&A pairs)
5. **Social Media Posts** (Twitter, LinkedIn formats)

**Content Generation Interface:**

**Layout:** Two-column (form on left, preview on right)

**Left Column: Generation Form**

**Content Type Selector:**
- Dropdown or button group
- Options: Blog Post, Meta Description, Title Tag, FAQ, Social Media
- Each type shows different form fields

**Common Fields (all types):**

1. **Target Keyword** (required)
   - Text input
   - Placeholder: "main keyword you want to rank for"
   - Helper text: "This will be naturally incorporated"

2. **Secondary Keywords** (optional)
   - Multi-input or comma-separated
   - Placeholder: "related keywords (optional)"
   - Helper: "Add 2-5 related terms"

3. **Tone** (required)
   - Dropdown: Professional, Casual, Friendly, Authoritative, Technical, Conversational
   - Default: Professional

4. **Target Audience** (optional)
   - Text input
   - Placeholder: "e.g., first-time homebuyers, tech executives"

**Blog Post Specific Fields:**

5. **Desired Length**
   - Slider or number input
   - Options: 500, 750, 1000, 1250, 1500, 2000 words
   - Shows estimated reading time

6. **Additional Context** (optional)
   - Textarea
   - Placeholder: "Any specific points to cover, unique angles, or info to include"
   - Character limit: 500

7. **Include Elements** (checkboxes)
   - ☐ FAQ section at end
   - ☐ Key takeaways/summary
   - ☐ Expert tips
   - ☐ Statistics/data points
   - ☐ Call-to-action

**Meta Description Specific:**
- Length: Fixed at 150-160 chars
- Include CTA: Checkbox

**FAQ Specific:**
- Number of questions: Dropdown (3, 5, 7, 10)
- Question style: Dropdown (How/What, Why, When/Where, Mixed)

**Social Media Specific:**
- Platform: Dropdown (Twitter/X, LinkedIn, Facebook)
- Include hashtags: Checkbox
- Include emoji: Checkbox

**Actions:**
- "Generate Content" button (primary, large)
- "Reset Form" button (secondary)
- Show credit counter: "4/5 content pieces used this month"

**Right Column: Preview/Editor**

**Before Generation:**
- Empty state
- Illustration or icon
- Text: "Fill out the form and click Generate to create content"

**During Generation:**
- Loading spinner
- Progress text: "Creating your content... This takes 15-30 seconds"
- Maybe fun messages: "Researching keywords..." → "Structuring content..." → "Adding SEO magic..."

**After Generation:**

**SEO Score Panel (top):**
- Overall score: 85/100 (large number with color)
  - Green: 80-100
  - Yellow: 60-79
  - Red: <60
- Breakdown:
  - ✓ Keyword usage: Good (target keyword appears 5 times)
  - ✓ Readability: Good (Flesch score 65)
  - ✓ Structure: Good (proper heading hierarchy)
  - ✓ Length: Good (1,247 words)
  - ⚠ Meta description: Missing (if blog post)
  - ✗ Internal links: None (suggest adding)
- Quick tips: "Add 2-3 internal links to improve SEO score"

**Content Editor:**
- Rich text editor (TipTap)
- Toolbar: Bold, Italic, Heading, List, Link, etc.
- Fully editable
- Auto-save draft (every 30 seconds)

**Actions (bottom):**
- "Save Draft" button
- "Regenerate" button (uses another credit)
- "Edit Prompt" button (go back to form, preserve settings)
- "Export" dropdown: Copy, Download .txt, Download .docx, (future: Publish to WordPress)

**Content Generation Logic:**

**Claude API Prompt Construction:**
```typescript
interface ContentRequest {
  type: 'blog' | 'meta-description' | 'title' | 'faq' | 'social'
  targetKeyword: string
  secondaryKeywords: string[]
  length?: number // word count for blog
  tone: string
  audience?: string
  context?: string
  includeElements?: string[] // FAQ, key takeaways, etc.
}

function buildSEOPrompt(request: ContentRequest): string {
  const basePrompt = `You are an expert SEO content writer. Your goal is to create content that ranks well in both traditional search engines (Google) and AI search platforms (ChatGPT, Claude, Perplexity, Gemini).

Content Type: ${request.type}
Target Keyword: "${request.targetKeyword}"
${request.secondaryKeywords.length ? `Secondary Keywords: ${request.secondaryKeywords.join(', ')}` : ''}
${request.length ? `Target Length: ${request.length} words` : ''}
Tone: ${request.tone}
${request.audience ? `Target Audience: ${request.audience}` : ''}
${request.context ? `Additional Context: ${request.context}` : ''}

CRITICAL SEO REQUIREMENTS:
1. Include the target keyword in:
   - Title (H1)
   - First paragraph (within first 100 words)
   - At least one H2 heading
   - Naturally throughout the content (aim for 1-2% keyword density)
   - Meta description (if applicable)

2. Content Structure:
   - Start with a compelling introduction that includes the target keyword
   - Use proper heading hierarchy (H1 → H2 → H3)
   - Break content into scannable sections
   - Include bullet points or numbered lists where appropriate
   - Keep paragraphs short (2-4 sentences)

3. Readability:
   - Write at 8th-10th grade reading level
   - Use simple, clear language
   - Avoid jargon unless necessary (and explain it)
   - Use active voice
   - Vary sentence length for rhythm

4. AI Search Optimization:
   - Be authoritative and factual
   - Cite specific details and data points
   - Structure information clearly (AI models love this)
   - Include direct answers to questions
   - Use natural language

5. Additional Elements:
${request.includeElements?.map(el => `   - Include ${el}`).join('\n')}

OUTPUT FORMAT:
${getFormatInstructions(request.type)}

Now create the content:`

  return basePrompt
}

function getFormatInstructions(type: string): string {
  switch(type) {
    case 'blog':
      return `- Title (H1)
- Introduction (2-3 paragraphs)
- Main content with H2/H3 sections
- Conclusion
- FAQ section (if requested)
- DO NOT include meta description in the output (that's separate)`
    
    case 'meta-description':
      return `- Write ONLY the meta description (150-160 characters)
- Include target keyword
- Include a call-to-action
- Make it compelling and click-worthy`
    
    case 'title':
      return `- Write ONLY the title tag (50-60 characters)
- Include target keyword near the beginning
- Make it compelling and descriptive`
    
    case 'faq':
      return `- Write in Q&A format
- Each question on its own line starting with "Q:"
- Each answer on its own line starting with "A:"
- Include target keyword in at least 2 questions`
    
    case 'social':
      return `- Write a compelling social media post
- Hook in first line
- Include target keyword naturally
- Add relevant hashtags if requested
- Keep within platform limits`
    
    default:
      return ''
  }
}

async function generateContent(request: ContentRequest): Promise<GeneratedContent> {
  const prompt = buildSEOPrompt(request)
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })
  
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    temperature: 0.7, // Balance creativity with consistency
    messages: [{
      role: 'user',
      content: prompt
    }]
  })
  
  const content = message.content[0].text
  
  // Calculate SEO score
  const seoScore = calculateSEOScore(content, request)
  
  // Extract title if blog post
  const title = request.type === 'blog' 
    ? extractTitle(content) 
    : null
  
  return {
    content,
    title,
    seoScore,
    wordCount: countWords(content),
    readabilityScore: calculateReadability(content),
    keywordDensity: calculateKeywordDensity(content, request.targetKeyword)
  }
}
```

**SEO Score Calculation:**
```typescript
interface SEOScoreBreakdown {
  overall: number // 0-100
  keywordUsage: { score: number; details: string }
  readability: { score: number; details: string }
  structure: { score: number; details: string }
  length: { score: number; details: string }
  suggestions: string[]
}

function calculateSEOScore(
  content: string,
  request: ContentRequest
): SEOScoreBreakdown {
  let totalScore = 0
  const suggestions: string[] = []
  
  // 1. Keyword Usage (25 points)
  const keywordCount = countOccurrences(content.toLowerCase(), request.targetKeyword.toLowerCase())
  const keywordDensity = (keywordCount / countWords(content)) * 100
  
  let keywordScore = 0
  if (keywordDensity >= 1 && keywordDensity <= 2) {
    keywordScore = 25 // Optimal
  } else if (keywordDensity >= 0.5 && keywordDensity < 1) {
    keywordScore = 20
    suggestions.push('Increase keyword usage slightly')
  } else if (keywordDensity > 2) {
    keywordScore = 15
    suggestions.push('Reduce keyword usage to avoid stuffing')
  } else {
    keywordScore = 10
    suggestions.push('Add more instances of target keyword')
  }
  
  // Check keyword in key positions
  const hasKeywordInTitle = content.toLowerCase().includes(request.targetKeyword.toLowerCase())
  const hasKeywordInFirstParagraph = content.slice(0, 500).toLowerCase().includes(request.targetKeyword.toLowerCase())
  
  if (!hasKeywordInTitle) suggestions.push('Add target keyword to title/heading')
  if (!hasKeywordInFirstParagraph) suggestions.push('Include target keyword in first paragraph')
  
  totalScore += keywordScore
  
  // 2. Readability (25 points)
  const fleschScore = calculateFleschReadingEase(content)
  let readabilityScore = 0
  if (fleschScore >= 60 && fleschScore <= 70) {
    readabilityScore = 25 // Optimal for web content
  } else if (fleschScore >= 50 && fleschScore < 60) {
    readabilityScore = 20
  } else if (fleschScore > 70) {
    readabilityScore = 22
  } else {
    readabilityScore = 15
    suggestions.push('Simplify language for better readability')
  }
  
  totalScore += readabilityScore
  
  // 3. Structure (25 points)
  let structureScore = 0
  
  const hasHeadings = /^#{1,3}\s/.test(content) || /<h[1-3]/.test(content)
  const hasParagraphs = content.split('\n\n').length >= 3
  const hasLists = /^[\-\*]\s|^\d+\.\s/.test(content)
  
  if (hasHeadings) structureScore += 10
  else suggestions.push('Add headings to structure content')
  
  if (hasParagraphs) structureScore += 10
  else suggestions.push('Break content into more paragraphs')
  
  if (hasLists) structureScore += 5
  else suggestions.push('Add bullet points or numbered lists')
  
  totalScore += structureScore
  
  // 4. Length (25 points)
  const wordCount = countWords(content)
  let lengthScore = 0
  
  if (request.type === 'blog') {
    if (wordCount >= request.length * 0.9 && wordCount <= request.length * 1.1) {
      lengthScore = 25 // Within 10% of target
    } else if (wordCount >= request.length * 0.8) {
      lengthScore = 20
    } else {
      lengthScore = 15
      suggestions.push(`Content is ${wordCount} words, aim for ${request.length}`)
    }
  } else {
    lengthScore = 25 // Other types don't have variable length
  }
  
  totalScore += lengthScore
  
  return {
    overall: totalScore,
    keywordUsage: {
      score: keywordScore,
      details: `Keyword appears ${keywordCount} times (${keywordDensity.toFixed(2)}% density)`
    },
    readability: {
      score: readabilityScore,
      details: `Flesch Reading Ease: ${fleschScore.toFixed(0)} (${getReadabilityLabel(fleschScore)})`
    },
    structure: {
      score: structureScore,
      details: hasHeadings ? 'Good heading structure' : 'Missing proper headings'
    },
    length: {
      score: lengthScore,
      details: `${wordCount} words`
    },
    suggestions
  }
}

// Flesch Reading Ease formula
function calculateFleschReadingEase(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  const words = countWords(text)
  const syllables = countSyllables(text)
  
  if (sentences === 0 || words === 0) return 0
  
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  return Math.max(0, Math.min(100, score))
}

function getReadabilityLabel(score: number): string {
  if (score >= 90) return 'Very Easy'
  if (score >= 80) return 'Easy'
  if (score >= 70) return 'Fairly Easy'
  if (score >= 60) return 'Standard'
  if (score >= 50) return 'Fairly Difficult'
  return 'Difficult'
}
```

**Content Management:**

**Saved Content List:**
- Table showing all generated/saved content
- Columns: Title, Type, Target Keyword, SEO Score, Created Date, Status (Draft/Published), Actions
- Filter by: Type, Date, Status
- Sort by: Date, SEO Score

**Content Detail/Edit View:**
- Full editor with all tools
- Update SEO score in real-time as user edits
- Version history (future)
- Export options

**Export Functionality:**
```typescript
// Export options
async function exportContent(content: GeneratedContent, format: 'txt' | 'docx' | 'html') {
  switch(format) {
    case 'txt':
      // Simple text download
      return new Blob([content.content], { type: 'text/plain' })
    
    case 'docx':
      // Convert markdown to Word document
      // Use library like 'docx' npm package
      const doc = new Document({
        sections: [{
          children: convertMarkdownToDocx(content.content)
        }]
      })
      return Packer.toBlob(doc)
    
    case 'html':
      // Convert markdown to HTML
      const html = marked(content.content)
      return new Blob([html], { type: 'text/html' })
  }
}
```

**Usage Tracking:**

Track content generation per billing period:
- Count pieces generated per month
- Enforce tier limits
- Show counter in UI
- Block generation when limit reached (with upgrade CTA)

**Database Schema:**
```sql
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL, -- blog, meta, title, faq, social
  title TEXT,
  content TEXT NOT NULL,
  seo_score INT,
  word_count INT,
  readability_score FLOAT,
  status TEXT DEFAULT 'draft', -- draft, published
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_project_date 
  ON generated_content(project_id, created_at DESC);
```

**Future Enhancements (Post-MVP):**
- WordPress direct publish
- Content calendar
- Bulk content generation
- Content templates
- A/B testing headlines
- Image generation integration
- Content refresh suggestions (update old content)

---

### 3.6 Trends & Insights

**Purpose:** Automatically surface actionable insights from SEO and AI search data.

**Insights Dashboard:**

**Header:**
- "Insights & Trends"
- Date range selector: Last 7 days, 30 days, 90 days, All time
- "Generate Report" button (creates downloadable PDF)

**Automated Insight Cards:**

Display 5-10 insight cards, each showing a key finding:

**Card Structure:**
- Icon (trophy, chart, alert, etc.)
- Title (concise insight)
- Description (2-3 sentences explaining)
- Visual (small chart or number if relevant)
- CTA button ("View Details" or "Optimize Now")

**Example Insights:**

**1. Top Performers**
- "🏆 Your best keyword: 'waterfront homes bainbridge island' ranks #3"
- Description: "This keyword moved up 8 positions this month and drives 23% of your visibility."
- CTA: "View keyword details"

**2. Biggest Improvements**
- "📈 5 keywords improved this week"
- List: "keyword A (+7), keyword B (+5), ..."
- CTA: "See all improvements"

**3. Opportunities**
- "💡 3 keywords on page 2 could break into page 1"
- List: "keyword X (rank 12), keyword Y (rank 14), ..."
- CTA: "Create optimized content"

**4. Declining Keywords**
- "⚠️ 2 keywords dropped this week"
- List: "keyword M (-5), keyword N (-3)"
- CTA: "Investigate & fix"

**5. AI Search Performance**
- "🤖 Your AI citation rate: 45% (↑ from 32%)"
- "You're cited most often in Perplexity (60% rate)"
- CTA: "View AI search dashboard"

**6. Competitor Movements**
- "👀 Competitor X gained ground on 4 keywords"
- "They now outrank you on 'keyword A' and 'keyword B'"
- CTA: "Analyze competitor"

**7. Content Opportunities**
- "📝 Create content for these high-value keywords:"
- List: "keyword P (1,200 searches/mo, difficulty 35)"
- CTA: "Generate content"

**8. Seasonal Trends**
- "📊 'vacation homes' searches increase 40% in spring"
- "Plan content now to rank when traffic peaks"
- CTA: "View seasonal analysis"

**Trends Analysis:**

**Rank Trend Chart:**
- Multi-line chart showing rank trends for top keywords
- X-axis: Time
- Y-axis: Rank position (inverted)
- Toggle individual keywords on/off
- Zoom to date range

**Citation Trend Chart:**
- Bar or line chart showing AI citation rate over time
- Breakdown by platform
- Compare to previous period

**Keyword Distribution:**
- Pie chart or bar chart showing:
  - How many keywords in positions 1-3
  - Positions 4-10
  - Positions 11-20
  - Positions 21+
  - Not ranking

**Competitive Landscape:**
- Table comparing your rank vs competitors across all keywords
- Highlight where you're winning/losing
- Show rank gaps

**Automated Weekly/Monthly Reports:**

**Email Digest:**

Sent automatically (can be disabled in settings):
- Weekly: For Starter+ users
- Monthly: For all users including Free

**Email Content:**

Subject: "Your SEO Performance Summary - [Date Range]"

**Body:**
```
Hi [Name],

Here's your SEO performance for [date range]:

📊 OVERVIEW
- Avg Rank: 18 (↑ from 23)
- AI Citation Rate: 45% (↑ from 32%)
- Keywords Tracked: 25
- Content Generated: 3 pieces

🏆 TOP WINS
- "waterfront homes" moved from #11 → #3 (🎉)
- First citation in ChatGPT for "luxury real estate"
- 5 keywords improved by 5+ positions

⚠️ NEEDS ATTENTION
- "keyword X" dropped from #8 → #15
- You're not cited in AI search for 3 important keywords

💡 RECOMMENDED ACTIONS
1. Create content optimizing for "keyword Y" (spotted gap vs competitor)
2. Update article about "keyword Z" (hasn't been checked by AI in 2 weeks)
3. Your "vacation homes" content performs well - create similar pieces

[View Full Dashboard Button]

You received this because you have email reports enabled. 
Manage preferences: [link]
```

**In-App Report Generation:**

**Generate Report Button:**
- Compiles current insights
- Exports to PDF
- Professional formatting
- Include charts and data tables
- Useful for showing clients (agency users)

**Report Sections:**
1. Executive Summary
2. Rank Performance
3. AI Search Performance
4. Competitor Analysis
5. Content Recommendations
6. Appendix (detailed data tables)

**Implementation:**
```typescript
async function generateInsights(projectId: string, dateRange: DateRange): Promise<Insight[]> {
  const insights: Insight[] = []
  
  // Fetch data
  const keywords = await getKeywords(projectId)
  const rankHistory = await getRankHistory(projectId, dateRange)
  const aiChecks = await getAISearchChecks(projectId, dateRange)
  const competitors = await getCompetitors(projectId)
  
  // 1. Top performers
  const topKeyword = findTopRankingKeyword(rankHistory)
  if (topKeyword) {
    insights.push({
      type: 'top_performer',
      title: `Your best keyword: "${topKeyword.keyword}" ranks #${topKeyword.rank}`,
      description: generateTopPerformerDescription(topKeyword),
      action: { label: 'View Details', url: `/keywords/${topKeyword.id}` }
    })
  }
  
  // 2. Biggest improvements
  const improvements = findBiggestImprovements(rankHistory, 5)
  if (improvements.length > 0) {
    insights.push({
      type: 'improvement',
      title: `${improvements.length} keywords improved`,
      description: improvements.map(k => `${k.keyword} (+${k.change})`).join(', '),
      action: { label: 'See All', url: '/keywords?filter=improved' }
    })
  }
  
  // 3. AI search performance
  const citationRate = calculateCitationRate(aiChecks)
  const previousRate = await getPreviousCitationRate(projectId, dateRange)
  if (citationRate !== previousRate) {
    const change = citationRate > previousRate ? 'up' : 'down'
    insights.push({
      type: 'ai_performance',
      title: `AI citation rate: ${citationRate}% (${change} from ${previousRate}%)`,
      description: generateAICitationDescription(aiChecks),
      action: { label: 'View AI Dashboard', url: '/ai-search' }
    })
  }
  
  // 4. Opportunities (keywords on page 2)
  const opportunities = findOpportunities(rankHistory)
  if (opportunities.length > 0) {
    insights.push({
      type: 'opportunity',
      title: `${opportunities.length} keywords could reach page 1`,
      description: opportunities.map(k => `${k.keyword} (rank ${k.rank})`).join(', '),
      action: { label: 'Create Content', url: '/content/generate' }
    })
  }
  
  // ... more insight generation logic
  
  return insights
}
```

**Notification Preferences:**

In Settings → Notifications, users can control:
- Email digest frequency (Never, Weekly, Monthly)
- Alert thresholds (notify when rank changes by X positions)
- Types of alerts (rank changes, AI citations, competitor movements)

---

## 4. Technical Architecture

### 4.1 Tech Stack

**Frontend:**
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Component Library:** shadcn/ui (built on Radix UI)
- **Charts:** Recharts
- **Rich Text Editor:** TipTap
- **Data Fetching:** React Query (TanStack Query)
- **State Management:** Zustand or React Context (lightweight needs)
- **Form Handling:** React Hook Form + Zod validation
- **Icons:** Lucide Icons

**Backend:**
- **API:** Next.js API Routes (serverless on Vercel)
- **Server Actions:** For mutations and server-side logic
- **Runtime:** Node.js (Vercel serverless)
- **Edge Functions:** Where beneficial (geolocation, simple lookups)

**Database:**
- **Primary:** Supabase (PostgreSQL)
- **ORM:** Supabase client (native) or Prisma (optional)
- **Real-time:** Supabase real-time subscriptions (for live updates)
- **Security:** Row Level Security (RLS) policies

**Authentication:**
- **Provider:** Supabase Auth
- **Methods:** Email/password, OAuth (Google optional)
- **Sessions:** JWT tokens, auto-refresh

**External APIs:**
- **AI Content Generation:** Anthropic Claude API (Sonnet 4)
- **AI Search - Claude:** Anthropic Messages API
- **AI Search - ChatGPT:** OpenAI Chat Completions API
- **AI Search - Perplexity:** Perplexity API
- **AI Search - Gemini:** Google Generative AI API
- **Traditional SEO:** DataForSEO (or SERPApi as backup)
- **Payments:** Stripe (Checkout, Customer Portal, Webhooks)

**Email:**
- **Provider:** Resend
- **Templates:** React Email for templates

**Deployment:**
- **Platform:** Vercel
- **CDN:** Vercel Edge Network
- **Regions:** Auto (Vercel serverless)

**Cron Jobs:**
- **Platform:** Vercel Cron Jobs
- **Alternative:** Could use Inngest or QStash for more complex workflows

**Monitoring & Analytics:**
- **Errors:** Sentry
- **Analytics:** Vercel Analytics or PostHog
- **Logging:** Vercel logs, Winston for structured logging

**Development:**
- **Package Manager:** pnpm (faster than npm/yarn)
- **Git:** GitHub
- **CI/CD:** Vercel (auto-deploy on push)
- **Code Quality:** ESLint, Prettier, TypeScript strict mode
- **Testing:** Jest (unit), Playwright (E2E - optional for MVP)

---

### 4.2 Database Schema

**Full Schema (SQL for Supabase/PostgreSQL):**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================
-- USERS & PROFILES
-- ======================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'agency')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_period_start TIMESTAMPTZ,
  subscription_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ======================
-- PROJECTS
-- ======================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- ======================
-- KEYWORDS
-- ======================

CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  target_url TEXT,
  search_volume INT,
  difficulty_score INT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, keyword)
);

-- RLS policies for keywords
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view keywords in own projects"
  ON keywords FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = keywords.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create keywords in own projects"
  ON keywords FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = keywords.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update keywords in own projects"
  ON keywords FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = keywords.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete keywords in own projects"
  ON keywords FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = keywords.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_keywords_project_id ON keywords(project_id);
CREATE INDEX idx_keywords_tags ON keywords USING GIN(tags);

-- ======================
-- RANK CHECKS
-- ======================

CREATE TABLE rank_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  rank INT, -- null if not ranking in top 100
  url TEXT, -- actual ranking URL
  search_engine TEXT DEFAULT 'google',
  location TEXT DEFAULT 'us',
  serp_features JSONB, -- {featured_snippet: bool, paa: bool, local_pack: bool, ...}
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for rank_checks
ALTER TABLE rank_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rank checks for own keywords"
  ON rank_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM keywords
      JOIN projects ON projects.id = keywords.project_id
      WHERE keywords.id = rank_checks.keyword_id
      AND projects.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_rank_checks_keyword_id ON rank_checks(keyword_id);
CREATE INDEX idx_rank_checks_keyword_date ON rank_checks(keyword_id, checked_at DESC);
CREATE INDEX idx_rank_checks_date ON rank_checks(checked_at DESC);

-- ======================
-- COMPETITORS
-- ======================

CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  name TEXT,
  domain_authority INT,
  backlink_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, domain)
);

-- RLS policies for competitors
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view competitors in own projects"
  ON competitors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = competitors.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create competitors in own projects"
  ON competitors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = competitors.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update competitors in own projects"
  ON competitors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = competitors.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete competitors in own projects"
  ON competitors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = competitors.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_competitors_project_id ON competitors(project_id);

-- ======================
-- COMPETITOR RANKS
-- ======================

CREATE TABLE competitor_ranks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  rank INT,
  url TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for competitor_ranks
ALTER TABLE competitor_ranks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view competitor ranks for own projects"
  ON competitor_ranks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM competitors
      JOIN projects ON projects.id = competitors.project_id
      WHERE competitors.id = competitor_ranks.competitor_id
      AND projects.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_competitor_ranks_competitor_id ON competitor_ranks(competitor_id);
CREATE INDEX idx_competitor_ranks_keyword_id ON competitor_ranks(keyword_id);
CREATE INDEX idx_competitor_ranks_lookup ON competitor_ranks(competitor_id, keyword_id, checked_at DESC);

-- ======================
-- AI SEARCH CHECKS
-- ======================

CREATE TABLE ai_search_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('claude', 'chatgpt', 'perplexity', 'gemini')),
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  is_cited BOOLEAN DEFAULT FALSE,
  cited_url TEXT,
  position INT, -- position among cited sources (1st, 2nd, 3rd...)
  total_sources INT, -- total number of sources cited
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for ai_search_checks
ALTER TABLE ai_search_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view AI checks for own projects"
  ON ai_search_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = ai_search_checks.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_ai_checks_project_id ON ai_search_checks(project_id);
CREATE INDEX idx_ai_checks_keyword_id ON ai_search_checks(keyword_id);
CREATE INDEX idx_ai_checks_project_date ON ai_search_checks(project_id, checked_at DESC);
CREATE INDEX idx_ai_checks_keyword_platform_date ON ai_search_checks(keyword_id, platform, checked_at DESC);

-- ======================
-- GENERATED CONTENT
-- ======================

CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('blog', 'meta-description', 'title', 'faq', 'social')),
  title TEXT,
  content TEXT NOT NULL,
  seo_score INT,
  word_count INT,
  readability_score FLOAT,
  keyword_density FLOAT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for generated_content
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view content for own projects"
  ON generated_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generated_content.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create content for own projects"
  ON generated_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generated_content.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update content for own projects"
  ON generated_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generated_content.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete content for own projects"
  ON generated_content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generated_content.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_content_project_id ON generated_content(project_id);
CREATE INDEX idx_content_project_date ON generated_content(project_id, created_at DESC);

-- ======================
-- USAGE TRACKING
-- ======================

CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('ai_check', 'content_generation', 'rank_check')),
  count INT DEFAULT 1,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id, resource_type, period_start)
);

-- RLS policies for usage_tracking
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_usage_user_period ON usage_tracking(user_id, resource_type, period_start);

-- ======================
-- FUNCTIONS & TRIGGERS
-- ======================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON competitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON generated_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- UTILITY VIEWS
-- ======================

-- View for latest rank per keyword
CREATE VIEW latest_ranks AS
SELECT DISTINCT ON (keyword_id)
  keyword_id,
  rank,
  url,
  serp_features,
  checked_at
FROM rank_checks
ORDER BY keyword_id, checked_at DESC;

-- View for keyword with latest rank
CREATE VIEW keywords_with_rank AS
SELECT
  k.*,
  lr.rank AS current_rank,
  lr.url AS ranking_url,
  lr.checked_at AS last_checked
FROM keywords k
LEFT JOIN latest_ranks lr ON lr.keyword_id = k.id;

-- View for AI citation rates per keyword
CREATE VIEW ai_citation_rates AS
SELECT
  keyword_id,
  COUNT(*) AS total_checks,
  SUM(CASE WHEN is_cited THEN 1 ELSE 0 END) AS times_cited,
  ROUND(100.0 * SUM(CASE WHEN is_cited THEN 1 ELSE 0 END) / COUNT(*), 1) AS citation_rate
FROM ai_search_checks
WHERE keyword_id IS NOT NULL
GROUP BY keyword_id;
```

**Database Diagram:**
```
profiles (user data)
  ↓
projects (websites/domains)
  ↓
  ├─→ keywords (tracked keywords)
  │     ├─→ rank_checks (traditional search rankings)
  │     └─→ ai_search_checks (AI search citations)
  │
  ├─→ competitors (competitor domains)
  │     └─→ competitor_ranks (competitor rankings)
  │
  └─→ generated_content (AI-generated content)

usage_tracking (usage limits per user)
```

---

### 4.3 API Routes Structure

**API Organization:**
```
/app/api/
├── auth/
│   └── [...] (handled by Supabase Auth callbacks)
│
├── projects/
│   ├── route.ts              GET, POST (list/create projects)
│   └── [id]/
│       └── route.ts          GET, PATCH, DELETE (get/update/delete project)
│
├── keywords/
│   ├── route.ts              GET, POST (list/create keywords)
│   ├── [id]/
│   │   └── route.ts          GET, PATCH, DELETE (get/update/delete keyword)
│   ├── bulk/
│   │   └── route.ts          POST (bulk import keywords)
│   └── export/
│       └── route.ts          GET (export keywords as CSV)
│
├── ranks/
│   ├── route.ts              GET (get rank data by keyword/date)
│   ├── check/
│   │   └── route.ts          POST (trigger manual rank check)
│   └── history/
│       └── [keywordId]/
│           └── route.ts      GET (get rank history for keyword)
│
├── competitors/
│   ├── route.ts              GET, POST (list/create competitors)
│   ├── [id]/
│   │   ├── route.ts          GET, PATCH, DELETE (get/update/delete competitor)
│   │   └── ranks/
│   │       └── route.ts      GET (get competitor rank data)
│   └── compare/
│       └── route.ts          GET (compare ranks across competitors)
│
├── ai-search/
│   ├── route.ts              GET (get AI search check history)
│   ├── check/
│   │   └── route.ts          POST (trigger manual AI search check)
│   ├── stats/
│   │   └── route.ts          GET (get citation stats/rates)
│   └── response/
│       └── [checkId]/
│           └── route.ts      GET (get detailed AI response)
│
├── content/
│   ├── route.ts              GET, POST (list/create content)
│   ├── [id]/
│   │   └── route.ts          GET, PATCH, DELETE (get/update/delete content)
│   ├── generate/
│   │   └── route.ts          POST (generate new content)
│   └── export/
│       └── [id]/
│           └── route.ts      GET (export content in various formats)
│
├── insights/
│   ├── dashboard/
│   │   └── route.ts          GET (get dashboard stats)
│   ├── trends/
│   │   └── route.ts          GET (get trend analysis)
│   └── report/
│       └── route.ts          POST (generate downloadable report)
│
├── billing/
│   ├── create-checkout/
│   │   └── route.ts          POST (create Stripe checkout session)
│   ├── create-portal/
│   │   └── route.ts          POST (create Stripe customer portal session)
│   ├── webhook/
│   │   └── route.ts          POST (handle Stripe webhooks)
│   └── usage/
│       └── route.ts          GET (get current usage vs limits)
│
└── cron/
    ├── daily-ranks/
    │   └── route.ts          GET (triggered by Vercel Cron)
    ├── weekly-ranks/
    │   └── route.ts          GET (triggered by Vercel Cron)
    ├── ai-checks/
    │   └── route.ts          GET (triggered by Vercel Cron)
    └── cleanup/
        └── route.ts          GET (cleanup old data)
```

**API Route Example (Keywords):**
```typescript
// /app/api/keywords/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/keywords?project_id=xxx
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check auth
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Get query params
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('project_id')
  
  if (!projectId) {
    return NextResponse.json({ error: 'project_id required' }, { status: 400 })
  }
  
  // Verify user owns project
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', session.user.id)
    .single()
  
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  
  // Fetch keywords
  const { data: keywords, error } = await supabase
    .from('keywords_with_rank') // Use view that includes latest rank
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ keywords })
}

// POST /api/keywords
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check auth
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Parse body
  const body = await request.json()
  const { project_id, keyword, target_url, tags } = body
  
  // Validate
  if (!project_id || !keyword) {
    return NextResponse.json({ error: 'project_id and keyword required' }, { status: 400 })
  }
  
  // Verify user owns project
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', session.user.id)
    .single()
  
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  
  // Check tier limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', session.user.id)
    .single()
  
  const limits = {
    free: 5,
    starter: 25,
    pro: 100,
    agency: 500
  }
  
  const { count } = await supabase
    .from('keywords')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', project_id)
  
  if (count >= limits[profile.subscription_tier]) {
    return NextResponse.json({ 
      error: 'Keyword limit reached for your tier',
      limit: limits[profile.subscription_tier]
    }, { status: 403 })
  }
  
  // Insert keyword
  const { data: newKeyword, error } = await supabase
    .from('keywords')
    .insert({
      project_id,
      keyword,
      target_url,
      tags
    })
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'Keyword already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Queue rank check job
  await queueRankCheck(newKeyword.id)
  
  return NextResponse.json({ keyword: newKeyword }, { status: 201 })
}
```

**API Route Example (AI Search Check):**
```typescript
// /app/api/ai-search/check/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { performAISearchCheck } from '@/lib/ai-search'
import { trackUsage, checkUsageLimit } from '@/lib/usage'

// POST /api/ai-search/check
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check auth
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Parse body
  const body = await request.json()
  const { keyword_ids, project_id } = body
  
  if (!keyword_ids || !Array.isArray(keyword_ids) || keyword_ids.length === 0) {
    return NextResponse.json({ error: 'keyword_ids array required' }, { status: 400 })
  }
  
  // Verify user owns project
  const { data: project } = await supabase
    .from('projects')
    .select('id, domain')
    .eq('id', project_id)
    .eq('user_id', session.user.id)
    .single()
  
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  
  // Check usage limits
  const checksNeeded = keyword_ids.length * 4 // 4 platforms per keyword
  const canProceed = await checkUsageLimit(
    session.user.id,
    'ai_check',
    checksNeeded
  )
  
  if (!canProceed.allowed) {
    return NextResponse.json({ 
      error: 'AI check limit reached for your tier',
      limit: canProceed.limit,
      used: canProceed.used
    }, { status: 403 })
  }
  
  // Fetch keywords
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id, keyword, target_url')
    .in('id', keyword_ids)
    .eq('project_id', project_id)
  
  if (!keywords || keywords.length === 0) {
    return NextResponse.json({ error: 'No valid keywords found' }, { status: 404 })
  }
  
  // Perform AI checks (async, don't wait)
  const checkPromises = keywords.map(keyword => 
    performAISearchCheck(
      keyword.id,
      keyword.keyword,
      project.domain,
      project_id
    )
  )
  
  // Track usage immediately
  await trackUsage(session.user.id, 'ai_check', checksNeeded)
  
  // Return immediately, checks run in background
  return NextResponse.json({ 
    message: 'AI search checks initiated',
    keywords_checked: keywords.length,
    total_checks: checksNeeded
  }, { status: 202 }) // 202 Accepted
  
  // Optional: Wait for checks to complete
  // const results = await Promise.all(checkPromises)
  // return NextResponse.json({ results })
}
```

**Cron Job Example:**
```typescript
// /app/api/cron/daily-ranks/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkKeywordRank } from '@/lib/dataforseo'

export async function GET(request: NextRequest) {
  // Verify cron secret (security)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for cron
  )
  
  // Get all users on Pro+ tier
  const { data: users } = await supabase
    .from('profiles')
    .select('id, subscription_tier')
    .in('subscription_tier', ['pro', 'agency'])
    .eq('subscription_status', 'active')
  
  if (!users || users.length === 0) {
    return NextResponse.json({ message: 'No eligible users' })
  }
  
  let totalChecked = 0
  
  // For each user, get their keywords and check ranks
  for (const user of users) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, domain')
      .eq('user_id', user.id)
    
    if (!projects) continue
    
    for (const project of projects) {
      const { data: keywords } = await supabase
        .from('keywords')
        .select('id, keyword, target_url')
        .eq('project_id', project.id)
      
      if (!keywords) continue
      
      // Check each keyword (with rate limiting)
      for (const keyword of keywords) {
        try {
          const result = await checkKeywordRank(keyword.keyword, project.domain)
          
          // Store result
          await supabase
            .from('rank_checks')
            .insert({
              keyword_id: keyword.id,
              rank: result.rank,
              url: result.url,
              serp_features: result.serpFeatures
            })
          
          totalChecked++
          
          // Rate limit: wait between checks
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`Error checking keyword ${keyword.id}:`, error)
        }
      }
    }
  }
  
  return NextResponse.json({ 
    message: 'Daily rank checks complete',
    keywords_checked: totalChecked
  })
}
```

**Vercel Cron Configuration:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/daily-ranks",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/weekly-ranks",
      "schedule": "0 6 * * 1"
    },
    {
      "path": "/api/cron/ai-checks",
      "schedule": "0 7 * * *"
    }
  ]
}
```

---

### 4.4 Authentication Flow

**Using Supabase Auth:**
```typescript
// /lib/supabase/client.ts (client-side)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => createClientComponentClient()

// /lib/supabase/server.ts (server-side)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () => createServerComponentClient({ cookies })
```

**Sign Up Flow:**
```typescript
// /app/(auth)/signup/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
          full_name: fullName
        }
      }
    })
    
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    
    // Show success message
    router.push('/verify-email')
  }
  
  return (
    <form onSubmit={handleSignUp}>
      {/* Form fields */}
    </form>
  )
}
```

**Auth Callback Handler:**
```typescript
// /app/auth/callback/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }
  
  // Redirect to onboarding or dashboard
  return NextResponse.redirect(new URL('/onboarding', request.url))
}
```

**Protected Route Middleware:**
```typescript
// /middleware.ts

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  
  // Redirect logged-in users away from auth pages
  if (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
  
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup']
}
```

---

## 5. User Flows

_(Already covered in section 3 for each feature - refer back)_

---

## 6. UI/UX Requirements

_(Already covered in section 3 - key points below for reference)_

### Design Principles

1. **Clean & Modern:** Vercel/Linear/Stripe aesthetic
2. **Data-Dense but Readable:** Information-rich without clutter
3. **Fast & Responsive:** Instant feedback, <2s page loads
4. **Accessible:** WCAG AA, keyboard navigation
5. **Mobile-Friendly:** Responsive design, mobile dashboard

### Color System

**Light Mode:**
- Primary: Blue (#0070F3)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)
- Gray scale: #F9FAFB → #111827

**Dark Mode:**
- Invert grays, adjust colors for contrast
- Use dark backgrounds, light text
- Reduce blue saturation slightly

### Typography

- Font family: Inter
- Base size: 16px
- Line height: 1.5-1.7
- Headings: 600-700 weight
- Body: 400 weight

### Component Usage (shadcn/ui)

Core components:
- Button, Card, Table, Dialog
- Form (Input, Select, Textarea, Checkbox)
- Tabs, Badge, Alert
- Progress, Skeleton
- Toast, DropdownMenu
- Command (for search/command palette)

---

## 7. Pricing & Monetization

### Tier Comparison

| Feature | Free | Starter ($29/mo) | Pro ($99/mo) | Agency ($299/mo) |
|---------|------|------------------|--------------|------------------|
| **Projects** | 1 | 1 | 3 | 10 |
| **Keywords Tracked** | 5 | 25 | 100 | 500 |
| **Competitors** | 1 | 3 | 10 | 25 |
| **AI Search Checks/Month** | 1 (manual) | 4 (weekly) | 30 (daily) | Unlimited |
| **Content Pieces/Month** | 1 | 5 | 20 | 100 |
| **Rank Updates** | Manual only | Weekly | Daily | Daily |
| **Email Reports** | ✗ | ✓ Weekly | ✓ Weekly | ✓ Daily |
| **Historical Data** | 30 days | 90 days | 1 year | Unlimited |
| **Export Data** | ✗ | CSV | CSV | CSV + API |
| **API Access** | ✗ | ✗ | ✗ | ✓ |
| **Priority Support** | ✗ | Email | Email + Chat | Phone + Dedicated |
| **White-label Reports** | ✗ | ✗ | ✗ | ✓ |

### Cost Analysis (per user/month)

**Free Tier:**
- 1 AI check (4 platforms): ~$0.04
- Manual rank checks: ~$0.02
- 1 content piece: ~$0.10
- **Total cost:** ~$0.16
- **Margin:** N/A (acquisition tool)

**Starter ($29):**
- 4 AI checks: ~$0.16
- 4 weekly rank checks (25 keywords): ~$5.00
- 5 content pieces: ~$0.50
- Infrastructure: ~$0.50
- **Total cost:** ~$6.16
- **Margin:** ~79%

**Pro ($99):**
- 30 AI checks: ~$2.40
- 30 daily rank checks (100 keywords): ~$90.00
- 20 content pieces: ~$2.00
- Infrastructure: ~$1.00
- **Total cost:** ~$25.40
- **Margin:** ~74%

**Agency ($299):**
- Unlimited AI checks (est. 100): ~$8.00
- Daily rank checks (500 keywords): ~$450/month → negotiate bulk pricing with DataForSEO
- 100 content pieces: ~$10.00
- Infrastructure: ~$2.00
- **Total cost (with negotiated rates):** ~$80-120
- **Margin:** ~60-70%

### Stripe Integration

**Setup:**
1. Create products in Stripe dashboard
2. Create price IDs (monthly recurring)
3. Set up webhook endpoint
4. Configure customer portal

**Checkout Flow:**
```typescript
// /app/api/billing/create-checkout/route.ts

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { tier } = await request.json() // 'starter', 'pro', 'agency'
  
  const priceIds = {
    starter: process.env.STRIPE_STARTER_PRICE_ID!,
    pro: process.env.STRIPE_PRO_PRICE_ID!,
    agency: process.env.STRIPE_AGENCY_PRICE_ID!
  }
  
  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', session.user.id)
    .single()
  
  let customerId = profile?.stripe_customer_id
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: {
        supabase_user_id: session.user.id
      }
    })
    
    customerId = customer.id
    
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', session.user.id)
  }
  
  // Create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{
      price: priceIds[tier],
      quantity: 1
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`
  })
  
  return NextResponse.json({ url: checkoutSession.url })
}
```

**Webhook Handler:**
```typescript
// /app/api/billing/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }
  
  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Update user subscription
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()
      
      if (profile) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const tier = getTierFromPriceId(subscription.items.data[0].price.id)
        
        await supabase
          .from('profiles')
          .update({
            stripe_subscription_id: subscriptionId,
            subscription_tier: tier,
            subscription_status: 'active',
            subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('id', profile.id)
      }
      break
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single()
      
      if (profile) {
        const tier = getTierFromPriceId(subscription.items.data[0].price.id)
        
        await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: subscription.status,
            subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('id', profile.id)
      }
      break
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single()
      
      if (profile) {
        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null
          })
          .eq('id', profile.id)
      }
      break
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('stripe_customer_id', invoice.customer as string)
        .single()
      
      if (profile) {
        await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('id', profile.id)
        
        // Send email notification
        // await sendPaymentFailedEmail(profile.email)
      }
      break
    }
  }
  
  return NextResponse.json({ received: true })
}

function getTierFromPriceId(priceId: string): string {
  const priceMap = {
    [process.env.STRIPE_STARTER_PRICE_ID!]: 'starter',
    [process.env.STRIPE_PRO_PRICE_ID!]: 'pro',
    [process.env.STRIPE_AGENCY_PRICE_ID!]: 'agency'
  }
  return priceMap[priceId] || 'free'
}
```

---

## 8. MVP Scope & Phases

### Phase 1: Core MVP (Weeks 1-6)

**Goal:** Validate core concept with early users

**Features:**
- ✓ Authentication (Supabase)
- ✓ Single project per user
- ✓ Add/manage keywords (up to 5 for free)
- ✓ Traditional rank tracking (Google US only, manual checks)
- ✓ Basic dashboard with rank data and charts
- ✓ Manual AI search checks (Claude + ChatGPT only)
- ✓ Basic content generation (blog posts only)
- ✓ Free tier only (no payments)

**Deliverables:**
- Functional web app deployed on Vercel
- Database schema implemented
- 5-10 beta users testing

**Success Metrics:**
- App is stable and functional
- Users can add keywords and see rank data
- Content generation works reliably
- Average page load < 2 seconds

---

### Phase 2: Monetization (Weeks 7-8)

**Goal:** Start generating revenue

**Features:**
- ✓ Stripe integration (checkout + webhooks)
- ✓ Pricing page with tier comparison
- ✓ Usage limits enforcement
- ✓ Upgrade/downgrade flows
- ✓ Billing management page (view subscription, usage, cancel)
- ✓ All 3 paid tiers activated (Starter, Pro, Agency)

**Deliverables:**
- Payment processing live
- User can upgrade via Stripe
- Tier limits enforced in app
- Customer portal for self-service

**Success Metrics:**
- First paying customer
- 3-5% free-to-paid conversion rate
- $0 monthly churn (too early)

---

### Phase 3: AI Search Expansion (Weeks 9-10)

**Goal:** Differentiate with comprehensive AI search tracking

**Features:**
- ✓ Add Perplexity API integration
- ✓ Add Gemini API integration
- ✓ Automated AI search checks via cron jobs
- ✓ AI search trends and historical data
- ✓ Citation rate analytics and charts
- ✓ Detailed AI response view with highlights

**Deliverables:**
- All 4 AI platforms tracked
- Scheduled checks running automatically
- Historical citation data viewable

**Success Metrics:**
- 90%+ successful AI check completion rate
- Users engaging with AI search dashboard
- Positive feedback on AI search feature

---

### Phase 4: Competitor Intelligence (Weeks 11-12)

**Goal:** Add competitive intelligence layer

**Features:**
- ✓ Add competitor tracking
- ✓ Competitor rank comparison table
- ✓ Keyword gap analysis (which keywords they rank for that you don't)
- ✓ Competitor rank changes over time
- ✓ Competitor insights and alerts

**Deliverables:**
- Competitors can be added and tracked
- Comparison views functional
- Gap analysis shows opportunities

**Success Metrics:**
- Users adding 2+ competitors on average
- Competitor data influences content decisions

---

### Phase 5: Polish & Scale (Weeks 13-14)

**Goal:** Production-ready, scalable product

**Features:**
- ✓ Email notifications and weekly/monthly reports
- ✓ Insights and trends automation (auto-generate insight cards)
- ✓ Performance optimization (caching, lazy loading)
- ✓ Multiple projects per user (Pro+ tiers)
- ✓ Export functionality (CSV, PDF reports)
- ✓ Mobile optimization (responsive everywhere)
- ✓ Dark mode
- ✓ Comprehensive error handling
- ✓ Help documentation/FAQ

**Deliverables:**
- Polished, production-ready app
- Documentation and help center
- Mobile-optimized experience
- Reliable performance under load

**Success Metrics:**
- Page load time < 2 seconds
- 99%+ uptime
- <1% error rate
- Positive user feedback on UX

---

### Phase 6: Growth Features (Post-MVP, Weeks 15+)

**Features to consider:**
- API access for Agency tier
- WordPress plugin for content export
- White-label reports (Agency)
- Team collaboration (multi-user accounts)
- More search engines (Bing, international Google)
- Backlink tracking
- Technical SEO audits (page speed, mobile, schema)
- Chrome extension (quick rank checks)
- Zapier integration
- Advanced content features (content calendar, A/B headline testing)
- Affiliate/referral program

**Prioritize based on:**
- User feedback
- Revenue potential
- Competitive differentiation
- Technical feasibility

---

## 9. Success Metrics

### Product Metrics

**Activation:**
- % users who add first keyword within 24 hours: Target >70%
- % users who complete onboarding: Target >80%

**Engagement:**
- % users who log in weekly: Target >40%
- Average sessions per week: Target 2-3
- Time spent in app: Target 10-15 minutes/session

**Retention:**
- Day 7 retention: Target >50%
- Day 30 retention: Target >30%
- Day 90 retention: Target >20%

**Conversion:**
- Free → Paid conversion rate: Target 3-5%
- Time to conversion (days): Track average
- Upgrade path (Free → Starter → Pro): Track progression

**Churn:**
- Monthly churn rate: Target <5%
- Reasons for churn: Track via exit survey
- Win-back rate: Track reactivations

### Business Metrics

**Revenue:**
- MRR (Monthly Recurring Revenue): Track growth
- ARR (Annual Recurring Revenue): Target $100K+ by end of year 1
- Revenue growth rate: Target 10-20% MoM

**Unit Economics:**
- ARPU (Average Revenue Per User): Track by tier
- LTV (Lifetime Value): Target >$500
- CAC (Customer Acquisition Cost): Target <$100
- LTV:CAC Ratio: Target >3:1
- Gross Margin: Target 75%+

**Acquisition:**
- Signups per week: Track growth
- Signup sources: Track channels (SEO, paid, referral)
- Landing page conversion rate: Target 3-5%

### Technical Metrics

**Performance:**
- Page load time: Target <2 seconds
- Time to first byte (TTFB): Target <500ms
- API response time: Target <200ms

**Reliability:**
- Uptime: Target 99.9%
- Error rate: Target <1%
- Failed API calls: Target <1%

**API Costs:**
- Cost per AI check: Track (optimize over time)
- Cost per rank check: Track
- Cost per content generation: Track

### User Satisfaction

**NPS (Net Promoter Score):** Target >50

**Feature Usage:**
- % users using AI search: Target >60%
- % users generating content: Target >40%
- % users tracking competitors: Target >30%

**Support:**
- Average response time: Target <4 hours
- Customer satisfaction rating: Target >4.5/5

---

## 10. Out of Scope for MVP

**Not Building (Initial Launch):**

- Enterprise features (SSO, custom contracts, dedicated support)
- White-label/reseller program
- Advanced technical SEO audits
- Comprehensive backlink tracking
- Social media management tools
- Multi-language support (UI + content generation)
- Native mobile apps (web only)
- Zapier integrations
- A/B testing features
- Heatmaps/session recording
- Advanced analytics (beyond built-in)
- Custom integrations/webhooks (except Agency API)
- Video content generation
- AI image generation (separate from content)
- Automated outreach/link building
- SERP feature targeting/optimization

---

## 11. Technical Considerations

### 11.1 Performance

**Optimization Strategies:**

1. **Caching:**
   - Cache dashboard stats: 5-minute TTL
   - Cache rank data: 1-hour TTL (updates aren't real-time anyway)
   - Cache AI search results: 24-hour TTL
   - Use React Query for client-side caching

2. **Database:**
   - Proper indexing (already defined in schema)
   - Connection pooling (Supabase handles this)
   - Query optimization (use EXPLAIN ANALYZE)

3. **API Routes:**
   - Paginate large data sets
   - Use streaming for large responses
   - Implement rate limiting

4. **Frontend:**
   - Code splitting (automatic with Next.js)
   - Lazy load components
   - Optimize images (next/image)
   - Virtual scrolling for long lists

5. **Background Jobs:**
   - Queue system for heavy operations
   - Batch API calls where possible
   - Implement retry logic

---

### 11.2 Security

**Best Practices:**

1. **Authentication:**
   - Use Supabase Auth (battle-tested)
   - Implement RLS policies (already defined)
   - Short-lived access tokens, refresh tokens

2. **API Security:**
   - Rate limiting on all endpoints
   - Input validation (Zod schemas)
   - SQL injection prevention (use parameterized queries)
   - CORS configuration

3. **Secrets Management:**
   - Store API keys in Vercel env variables
   - Never commit secrets to git
   - Rotate keys regularly

4. **Data Protection:**
   - HTTPS everywhere (Vercel provides)
   - Encrypt sensitive data at rest (Supabase default)
   - Sanitize user inputs

5. **CSRF Protection:**
   - Supabase handles CSRF tokens
   - Use SameSite cookies

---

### 11.3 Scalability

**Design for Scale:**

1. **Serverless Architecture:**
   - Next.js API routes auto-scale on Vercel
   - No servers to manage
   - Pay per execution

2. **Database:**
   - Supabase scales with user growth
   - Upgrade plan as needed
   - Can migrate to dedicated instance if required

3. **API Calls:**
   - Implement queue for bulk operations
   - Batch requests where possible
   - Cache aggressively

4. **Job Processing:**
   - Use efficient queue system (Vercel Cron + simple queue)
   - Consider Inngest for complex workflows at scale

5. **CDN:**
   - Static assets via Vercel Edge Network
   - Global distribution

---

### 11.4 Error Handling

**Comprehensive Error Management:**

1. **User-Facing Errors:**
   - Clear, actionable error messages
   - Toast notifications for temporary errors
   - Error boundaries for React components

2. **API Errors:**
   - Proper HTTP status codes
   - Structured error responses: `{ error: string, code: string }`
   - Retry logic for transient failures

3. **Logging:**
   - Use Sentry for error tracking
   - Log API errors with context
   - Monitor error rates

4. **Graceful Degradation:**
   - If AI check fails, show cached data
   - If rank check fails, retry later
   - Don't block user experience

---

### 11.5 Testing

**Testing Strategy:**

1. **Unit Tests:**
   - Test critical business logic
   - Test utility functions
   - Use Jest

2. **Integration Tests:**
   - Test API routes
   - Test database operations
   - Mock external APIs

3. **E2E Tests (Optional for MVP):**
   - Test critical user flows
   - Use Playwright
   - Run in CI/CD

4. **Manual QA:**
   - Test all features before launch
   - Test on multiple devices/browsers
   - Beta testing with real users

---

## 12. Go-to-Market Strategy

### Pre-Launch (Weeks 1-12)

**Build in Public:**
- Share progress on Twitter/LinkedIn
- Post updates in IndieHackers
- Build email waitlist (landing page)

**Content Marketing:**
- Blog: "The Future of SEO: Why AI Search Matters"
- Blog: "How to Rank in ChatGPT, Claude, and Perplexity"
- Blog: "AI Search Optimization: A Complete Guide"

**Target:** 100-200 email signups before launch

---

### Launch (Week 13-14)

**Launch Channels:**
- Product Hunt (main launch)
- IndieHackers (show IH)
- Reddit: r/SEO, r/bigseo, r/entrepreneur (be helpful, not spammy)
- HackerNews (if relevant story angle)
- Twitter/LinkedIn announcements

**Launch Offer:**
- Founding member discount: 20% off first year
- Lifetime deal for first 50 customers (risky but generates buzz)

**Target:** 500+ signups in first week

---

### Post-Launch (Month 2-6)

**SEO Strategy:**
- Target long-tail keywords:
  - "ai search optimization tools"
  - "how to rank in chatgpt"
  - "claude ai seo"
  - "perplexity seo optimization"
- Write 2-3 blog posts per week
- Build backlinks (guest posts, podcasts)

**Content Marketing:**
- Case studies (real user results)
- Video tutorials (YouTube)
- Comparison articles ("Tool A vs Tool B")

**Outreach:**
- Email real estate agents (you know this market)
- Email small agencies
- LinkedIn outreach to marketers

**Partnerships:**
- Integrate with WordPress (plugin)
- Partner with marketing agencies
- Affiliate program (future)

**Paid Ads (if budget allows):**
- Google Ads: Target "seo tools" keywords
- LinkedIn Ads: Target marketers/agencies
- Facebook Ads: Interest targeting (digital marketing)

---

### Growth (Month 6-12)

**Referral Program:**
- Give existing users 1 month free for each referral
- Referred user gets 10% off first month

**Feature-Led Growth:**
- Free tier is generous enough to provide value
- Users naturally upgrade as they see results

**Community:**
- Build Slack/Discord community
- Host webinars on SEO and AI search
- Share success stories

**Target:** 1,000+ users, 50+ paying customers by end of year 1

---

## 13. Open Questions / Decisions Needed

1. **Product Name:** Need brand name (domain availability check)
   - Suggestions: RankAI, AIRank, SearchSync, CitationTracker, RankBoth, SEOFusion
   - Check domain availability (.com preferred)

2. **API Provider for Rank Tracking:**
   - DataForSEO: Better pricing, more features
   - SERPApi: Simpler, good docs
   - Recommendation: Start with DataForSEO

3. **Job Queue System:**
   - Option 1: Simple (Vercel Cron + database queue)
   - Option 2: Dedicated service (Inngest, QStash)
   - Recommendation: Start simple, migrate if needed

4. **Analytics Provider:**
   - Vercel Analytics: Built-in, simple
   - PostHog: More features, self-hosted option
   - Recommendation: Start with Vercel, add PostHog if needed

5. **Email Provider:**
   - Resend: Modern, good DX
   - SendGrid: More established
   - Recommendation: Resend

6. **Content Generation Model:**
   - Claude Sonnet 4: Best quality, higher cost
   - Claude Haiku 4.5: Fast, cheaper, good for shorter content
   - Recommendation: Sonnet 4 for MVP, optimize later

7. **Founding Member Pricing:**
   - Offer lifetime discount (20% off)?
   - Lifetime deal for first X customers?
   - Time-limited launch pricing?

8. **White-Label as Feature or Separate Product?**
   - Add to Agency tier?
   - Or create separate "Reseller" program?
   - Recommendation: Agency tier feature to start

9. **Mobile App?**
   - Native app (React Native)?
   - Or PWA sufficient?
   - Recommendation: PWA for MVP, native later if demand

---

## 14. Appendix: Example API Calls

### DataForSEO Rank Check
```javascript
// Check keyword rank
const credentials = Buffer.from(`${login}:${password}`).toString('base64')

const response = await fetch(
  'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
  {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      keyword: 'best bainbridge island real estate agents',
      location_name: 'United States',
      language_code: 'en',
      device: 'desktop',
      os: 'windows'
    }])
  }
)

const data = await response.json()
const items = data.tasks[0].result[0].items

// Find user's domain
const userResult = items.find(item => 
  item.url?.includes('jakeaspinwall.com')
)

const rank = userResult ? userResult.rank_absolute : null
```

---

### AI Search - Claude
```javascript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: 'Who are the best real estate agents on Bainbridge Island? Please provide specific recommendations with websites if available.'
  }]
})

const response = message.content[0].text
const isCited = response.includes('jakeaspinwall.com')
```

---

### AI Search - ChatGPT
```javascript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{
    role: 'user',
    content: 'Who are the best real estate agents on Bainbridge Island?'
  }],
  max_tokens: 1000
})

const response = completion.choices[0].message.content
const isCited = response.includes('jakeaspinwall.com')
```

---

### AI Search - Perplexity
```javascript
const response = await fetch('https://api.perplexity.ai/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'sonar',
    messages: [{
      role: 'user',
      content: 'Who are the best real estate agents on Bainbridge Island?'
    }]
  })
})

const data = await response.json()
const responseText = data.choices[0].message.content
const citations = data.citations || []
const isCited = citations.some(c => c.url?.includes('jakeaspinwall.com'))
```

---

### AI Search - Gemini
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

const result = await model.generateContent(
  'Who are the best real estate agents on Bainbridge Island?'
)

const response = result.response.text()
const isCited = response.includes('jakeaspinwall.com')
```

---

### Content Generation
```javascript
const prompt = `You are an expert SEO content writer...

Target Keyword: "luxury waterfront homes bainbridge island"
Length: 1200 words
Tone: Professional but approachable

Create a blog post optimized for both traditional search and AI search...`

const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 4000,
  messages: [{
    role: 'user',
    content: prompt
  }]
})

const generatedContent = message.content[0].text
```

---

## 15. File Structure
```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── verify-email/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard home
│   │   ├── keywords/
│   │   │   ├── page.tsx                # Keywords list
│   │   │   └── [id]/page.tsx           # Keyword detail
│   │   ├── ai-search/
│   │   │   └── page.tsx                # AI search dashboard
│   │   ├── competitors/
│   │   │   ├── page.tsx                # Competitors list
│   │   │   └── [id]/page.tsx           # Competitor detail
│   │   ├── content/
│   │   │   ├── page.tsx                # Content list
│   │   │   ├── generate/page.tsx       # Content generation
│   │   │   └── [id]/page.tsx           # Content detail/edit
│   │   ├── insights/
│   │   │   └── page.tsx                # Insights dashboard
│   │   └── settings/
│   │       ├── page.tsx                # Profile settings
│   │       ├── billing/page.tsx        # Billing & subscription
│   │       └── notifications/page.tsx  # Notification preferences
│   │
│   ├── onboarding/
│   │   └── page.tsx
│   │
│   ├── pricing/
│   │   └── page.tsx
│   │
│   ├── api/
│   │   ├── auth/[...]/route.ts         # Supabase auth callbacks
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── keywords/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   ├── bulk/route.ts
│   │   │   └── export/route.ts
│   │   ├── ranks/
│   │   │   ├── route.ts
│   │   │   ├── check/route.ts
│   │   │   └── history/[keywordId]/route.ts
│   │   ├── competitors/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts
│   │   │   │   └── ranks/route.ts
│   │   │   └── compare/route.ts
│   │   ├── ai-search/
│   │   │   ├── route.ts
│   │   │   ├── check/route.ts
│   │   │   ├── stats/route.ts
│   │   │   └── response/[checkId]/route.ts
│   │   ├── content/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   ├── generate/route.ts
│   │   │   └── export/[id]/route.ts
│   │   ├── insights/
│   │   │   ├── dashboard/route.ts
│   │   │   ├── trends/route.ts
│   │   │   └── report/route.ts
│   │   ├── billing/
│   │   │   ├── create-checkout/route.ts
│   │   │   ├── create-portal/route.ts
│   │   │   ├── webhook/route.ts
│   │   │   └── usage/route.ts
│   │   └── cron/
│   │       ├── daily-ranks/route.ts
│   │       ├── weekly-ranks/route.ts
│   │       ├── ai-checks/route.ts
│   │       └── cleanup/route.ts
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                             # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   ├── progress.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── dashboard/
│   │   ├── stats-card.tsx
│   │   ├── rank-chart.tsx
│   │   ├── activity-feed.tsx
│   │   └── quick-actions.tsx
│   │
│   ├── keywords/
│   │   ├── keyword-table.tsx
│   │   ├── keyword-form.tsx
│   │   ├── bulk-import-modal.tsx
│   │   └── rank-history-chart.tsx
│   │
│   ├── ai-search/
│   │   ├── platform-stats.tsx
│   │   ├── citation-table.tsx
│   │   ├── response-modal.tsx
│   │   └── citation-trend-chart.tsx
│   │
│   ├── competitors/
│   │   ├── competitor-card.tsx
│   │   ├── comparison-table.tsx
│   │   └── gap-analysis.tsx
│   │
│   ├── content/
│   │   ├── generation-form.tsx
│   │   ├── content-editor.tsx
│   │   ├── seo-score-panel.tsx
│   │   └── content-list.tsx
│   │
│   ├── insights/
│   │   ├── insight-card.tsx
│   │   ├── trend-chart.tsx
│   │   └── report-generator.tsx
│   │
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       ├── user-menu.tsx
│       └── project-selector.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Client-side Supabase client
│   │   ├── server.ts                   # Server-side Supabase client
│   │   └── types.ts                    # Generated database types
│   │
│   ├── stripe/
│   │   ├── client.ts
│   │   └── webhooks.ts
│   │
│   ├── api/
│   │   ├── anthropic.ts                # Claude API client
│   │   ├── openai.ts                   # ChatGPT API client
│   │   ├── google.ts                   # Gemini API client
│   │   ├── perplexity.ts               # Perplexity API client
│   │   └── dataforseo.ts               # DataForSEO API client
│   │
│   ├── ai-search/
│   │   ├── check.ts                    # AI search check logic
│   │   ├── parse.ts                    # Response parsing
│   │   └── queue.ts                    # Job queueing
│   │
│   ├── seo/
│   │   ├── rank-check.ts               # Rank checking logic
│   │   ├── competitor.ts               # Competitor analysis
│   │   └── insights.ts                 # Insight generation
│   │
│   ├── content/
│   │   ├── generate.ts                 # Content generation
│   │   ├── score.ts                    # SEO score calculation
│   │   └── export.ts                   # Export utilities
│   │
│   ├── usage/
│   │   ├── track.ts                    # Usage tracking
│   │   └── limits.ts                   # Tier limit checking
│   │
│   ├── utils/
│   │   ├── dates.ts
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   └── cn.ts                       # Tailwind class merger
│   │
│   └── hooks/
│       ├── use-auth.ts
│       ├── use-project.ts
│       ├── use-keywords.ts
│       ├── use-subscription.ts
│       └── use-toast.ts
│
├── types/
│   ├── database.ts                     # Supabase generated types
│   ├── api.ts                          # API request/response types
│   └── index.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── .env.local
├── .env.example
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── vercel.json                         # Cron job config
└── README.md
```

---

## 16. Next Steps

**Immediate Actions:**

1. ✅ Review and approve this PRD
2. Choose product name and register domain
3. Set up development environment:
   - Create Next.js project
   - Set up Supabase project
   - Configure environment variables
4. Start Phase 1 development with Claude Code

**Development Order:**

1. Project setup and configuration
2. Database schema implementation
3. Authentication system
4. Core dashboard structure
5. Keywords management
6. Traditional rank tracking
7. AI search integration
8. Content generation
9. Billing integration
10. Polish and launch

**Estimated Timeline:** 12-14 weeks to MVP launch

---

**Document Version:** 1.0  
**Last Updated:** January 4, 2026  
**Status:** Ready for Development

---

*This PRD is a living document and will be updated as requirements evolve during development.*