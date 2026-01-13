# CLAUDE.md

Guidelines for AI assistants (Claude Code) working on this codebase.

## 📍 Start Here

**Before writing any code:**
1. Read `plan.md` - Understand current priorities, known issues, and feature status
2. Check `ai-seo-prd.md` - Reference for architecture, tech stack, and feature requirements
3. Review existing code patterns - Maintain consistency with established patterns

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start Next.js dev server (localhost:3000)
npm run type-check       # TypeScript type checking
npm run lint             # ESLint checking
npm run lint:fix         # Auto-fix linting issues

# Testing
npm test                 # Run Jest tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # Coverage report

# Database
# Migrations: Run SQL files in supabase/migrations/ via Supabase Dashboard
```

## ✅ Code Quality Standards

### Always Do
- ✅ Use TypeScript strict mode (no `any` types)
- ✅ Validate ALL user input with Zod schemas
- ✅ Check `plan.md` before starting work
- ✅ Use `router.refresh()` for data updates (NOT `window.location.reload()`)
- ✅ Extract repeated code into utilities/hooks
- ✅ Use `next/image` for images (NOT `<img>`)
- ✅ Add proper loading and error states
- ✅ Use database transactions for multi-step operations
- ✅ Check for private IPs in user-provided URLs
- ✅ Set timeouts on regex operations and API calls
- ✅ Update `plan.md` when discovering new issues

### Never Do
- ❌ Use `any` types (use `unknown` + type guards)
- ❌ Skip input validation on API endpoints
- ❌ Store sensitive data in localStorage
- ❌ Use raw SQL queries (use Supabase client only)
- ❌ Hard-code config values (use env vars)
- ❌ Trust user input in regex without validation
- ❌ Fetch URLs without SSRF checks
- ❌ Fire-and-forget async without error handling

## 🔒 Security Checklist

**Every feature MUST address:**

1. **Authentication** - All API routes use `getUser()` (not `getSession()`)
2. **Authorization** - Verify user owns resource before operations
3. **Input Validation** - Zod schemas on all endpoints
4. **RLS Policies** - Database enforces access control
5. **SSRF Protection** - Block private IPs (`isPrivateIP()` check)
6. **Injection Prevention** - Escape user input in AI prompts
7. **Rate Limiting** - Applied to expensive operations
8. **Timeout Protection** - All external calls timeout after max 30s
9. **Regex Safety** - User patterns limited to 100 chars + timeout check
10. **Transaction Safety** - Critical operations in DB transactions

### High-Risk Vulnerabilities to Avoid
- **SSRF**: Never fetch user URLs without IP validation
- **SQL Injection**: Never use raw SQL with user input
- **Regex DoS**: Timeout and validate user-provided patterns
- **Race Conditions**: Use DB constraints for concurrency
- **Prompt Injection**: Escape user input in AI prompts

## 🧪 Testing Requirements

### Required Tests for New Features
1. **Unit Tests** - Individual functions and utilities (100% coverage)
2. **Integration Tests** - API endpoints with database (80% minimum)
3. **Security Tests** - Authentication, authorization, validation
4. **Type Safety** - Zero TypeScript errors

### What to Always Test
- Authentication & authorization flows
- Input validation & error handling
- RLS policy enforcement
- Boundary conditions (empty data, null, max limits)
- Error paths (API failures, timeouts, invalid input)
- Race conditions (concurrent operations)

## 🗄️ Database Migrations

### Before Creating a Migration
1. Check existing schema - Read all migrations first
2. Verify column usage - Grep codebase for references
3. Match constraints - CHECK constraints = application logic
4. Plan rollback - All migrations must be reversible
5. Test with data - Run on copy of production data

### Migration Checklist
- [ ] All code-referenced columns exist in schema
- [ ] CHECK constraints match Zod validation schemas
- [ ] Foreign keys have proper ON DELETE behavior
- [ ] Indexes on all frequently queried columns
- [ ] RLS policies cover SELECT, INSERT, UPDATE, DELETE
- [ ] Tested on staging before production
- [ ] Can be rolled back without data loss

## 🚀 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Type checking clean (`npm run type-check`)
- [ ] Linting clean (`npm run lint`)
- [ ] **All changes committed and pushed to GitHub**
- [ ] No `console.log` in production code
- [ ] Critical issues from `plan.md` resolved
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Rate limiting enabled
- [ ] Error tracking active
- [ ] Monitoring alerts configured

## 💰 Cost Management

### AI API Cost Controls
- Use prompt caching (30%+ savings)
- Cache AI search results (24h TTL)
- Rate limit per tier:
  - Free: 1 content/month, 1 AI check/month
  - Starter: 5 content/month, 10 AI checks/month
  - Pro: 30 content/month, unlimited checks
- Monitor daily costs in `api_usage` table
- Alert if > $100/day

## 🔍 Common Patterns

### API Endpoint Structure
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limiter'
import { z } from 'zod'

const schema = z.object({
  field: z.string().min(1).max(255)
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Rate limit check
    const rateLimit = rateLimiters.standard.check(user.id, 'endpoint-name')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      )
    }

    // 3. Input validation
    const body = await request.json()
    const validation = schema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    // 4. Authorization check (verify ownership)
    const { data: resource } = await supabase
      .from('table')
      .select('*')
      .eq('id', validation.data.resourceId)
      .eq('user_id', user.id)
      .single()

    if (!resource) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // 5. Business logic
    // ...

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
```

### SSRF Protection Pattern
```typescript
import { isPrivateIP } from '@/lib/services/website-analyzer'

async function fetchUrl(url: string) {
  const urlObj = new URL(url)

  // CRITICAL: Check for private IPs
  if (isPrivateIP(urlObj.hostname)) {
    throw new Error(`Cannot access private IP: ${urlObj.hostname}`)
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000) // 30s timeout
  })

  return response
}
```

### Regex Pattern Validation
```typescript
function validatePattern(pattern: string): void {
  // 1. Length check
  if (pattern.length > 100) {
    throw new Error('Pattern too long (max 100 chars)')
  }

  // 2. Compilation timeout check
  const startTime = Date.now()
  const regex = new RegExp(pattern, 'i')

  if (Date.now() - startTime > 100) {
    throw new Error('Pattern too complex')
  }
}
```

## 🆘 When Stuck

1. **Check `plan.md`** - Known issues with solutions
2. **Reference `ai-seo-prd.md`** - Architecture and design decisions
3. **Review similar code** - Find patterns in existing files
4. **Check tests** - See intended usage examples
5. **Read migrations** - Understand schema evolution

### Useful Search Commands
```bash
# Find API endpoints
find src/app/api -name "route.ts"

# Find component usage
grep -r "ComponentName" src/

# Check for security issues
grep -r "isPrivateIP\|matchesPattern\|rateLimiters" src/

# View database schema
cat supabase/migrations/*.sql | grep "CREATE TABLE"
```

## 📋 Workflow

### Feature Development
1. Read `plan.md` - Check priorities and dependencies
2. Create tests first - TDD for critical features
3. Implement - Follow patterns above
4. Run checks - `npm test && npm run type-check && npm run lint`
5. **Commit changes** - Use conventional commits with Co-Authored-By line
6. **Push to GitHub** - Backup work immediately after major features
7. Update `plan.md` - Document new issues

### Bug Fixes
1. Add regression test first
2. Fix minimal code to pass test
3. Update `plan.md` with root cause
4. Run full test suite

## 🔄 Git Commit Guidelines

### When to Commit

**Commit after completing:**
1. **Major features** - Any substantial new functionality (e.g., billing system, new page, major component)
2. **Security fixes** - Critical security patches or vulnerability fixes
3. **Database migrations** - After creating and testing a migration file
4. **Bug fixes** - After fixing a reported issue and adding tests
5. **Refactoring** - After completing a significant code cleanup

**Commit message format:**
```bash
git add .
git commit -m "feat: add billing page with Stripe integration

- Implement checkout flow
- Add subscription management
- Enforce usage limits
- Add tests for payment flows

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Commit message types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring without behavior change
- `test:` - Adding or updating tests
- `docs:` - Documentation updates
- `chore:` - Maintenance tasks (deps, config)
- `security:` - Security fixes

### When to Push

**Push to GitHub after:**
1. **Every major feature commit** - Don't let work sit locally
2. **Before switching tasks** - Ensure work is backed up
3. **End of work session** - Push all commits before stepping away
4. **After fixing critical bugs** - Get fixes backed up immediately

**Push command:**
```bash
git push origin main
```

### DO NOT Commit
- ❌ Broken code that doesn't compile
- ❌ Code with failing tests
- ❌ Sensitive data (API keys, passwords, tokens)
- ❌ Large binary files without Git LFS
- ❌ node_modules or build artifacts
- ❌ Half-finished features (use branches instead)

### Example Workflow

```bash
# After completing a feature
git status                    # Review changes
npm test                      # Ensure tests pass
npm run type-check            # Verify TypeScript
git add .                     # Stage changes
git commit -m "feat: ..."     # Commit with message
git push origin main          # Push to GitHub

# Update plan.md if needed
# Document any new issues discovered
```

## 📖 Key Files Reference

- `plan.md` - Current status, issues, priorities, feature gaps
- `ai-seo-prd.md` - Product requirements, architecture, design
- `PROJECT_STATUS.md` - Completed features and known limitations
- `TODO.md` - Future features roadmap
- `src/lib/rate-limiter.ts` - Rate limiting implementation
- `src/lib/services/website-analyzer.ts` - Crawler with security patterns
- `supabase/migrations/` - Database schema evolution

---

**Remember:** Every change should maintain code quality, include tests, and prioritize security. When in doubt, check `plan.md` first.
