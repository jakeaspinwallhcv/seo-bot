# Security Documentation

## Overview

This document outlines the security measures implemented in the AI SEO Platform to protect user data and prevent common vulnerabilities.

## Authentication & Authorization

### Supabase Authentication
- **Email/password authentication** with secure password hashing (bcrypt)
- **Email verification** required before account access
- **JWT-based sessions** with automatic token refresh
- **Session expiration** enforced by Supabase

### Row-Level Security (RLS)
- **Database-level access control** enforced on all tables
- **Multi-tenant isolation** - users can only access their own data
- **Automatic policy enforcement** via Supabase RLS policies

```sql
-- Example RLS policy
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);
```

### Protected Routes
- **Middleware-based protection** for dashboard and onboarding routes
- **Automatic redirection** to login for unauthenticated users
- **Server-side session validation** on every protected route

## Input Validation & Sanitization

### Form Validation (Zod)
All user inputs are validated using Zod schemas with:
- **Type checking** - ensures correct data types
- **Length limits** - prevents DoS attacks via large inputs
- **Format validation** - validates domains, URLs, emails
- **HTML tag prevention** - blocks `<` and `>` characters
- **Whitespace trimming** - prevents injection attacks

### Domain Validation
```typescript
// Security: Domain regex to prevent malicious input
const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i

// Security: Sanitize domain input
export function sanitizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')   // Remove protocol
    .replace(/\/.*$/, '')           // Remove path
    .replace(/^www\./, '')          // Remove www
}
```

### URL Validation
```typescript
// Security: Validate URL and prevent javascript: protocol
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
```

## Tier Limits & Rate Limiting

### Tier-Based Resource Limits
- **Free tier**: 1 project, 5 keywords, 1 AI check/month, 1 content gen/month
- **Limits enforced** on both client and server side
- **Database uniqueness constraints** prevent duplicate keywords
- **Usage tracking** in dedicated table

### Validation Before Database Operations
```typescript
// Security: Validate tier limit before insert
validateTierLimit(
  profile.subscription_tier || 'free',
  'projects',
  count || 0
)
```

## Data Protection

### Sensitive Data Handling
- **Environment variables** stored in `.env.local` (gitignored)
- **API keys never exposed** to client-side code
- **Service role key** (if used) only in server-side code
- **No sensitive data in logs** or error messages

### Database Security
- **Prepared statements** via Supabase client (prevents SQL injection)
- **No raw SQL queries** with user input
- **Encrypted connections** to Supabase (SSL/TLS)
- **Regular backups** managed by Supabase

## XSS Prevention

### Input Sanitization
- **HTML tags blocked** in all text inputs
- **React's built-in XSS protection** (automatic escaping)
- **No `dangerouslySetInnerHTML`** used in codebase
- **Strict CSP headers** (to be added in production)

### Content Security Policy (Production)
```javascript
// Next.js config - to be added
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."
  }
]
```

## CSRF Protection

- **SameSite cookies** set by Supabase for session management
- **Origin validation** via Supabase
- **No state-changing GET requests**

## API Security

### Server-Side Validation
All API routes validate:
1. **User authentication** (valid session)
2. **User authorization** (owns the resource)
3. **Input validation** (Zod schemas)
4. **Tier limits** (hasn't exceeded quota)

### Example Secure API Route
```typescript
export async function POST(request: Request) {
  // 1. Authenticate
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Validate input
  const body = await request.json()
  const validated = schema.parse(body)  // Throws if invalid

  // 3. Authorize (check ownership)
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', validated.projectId)
    .eq('user_id', session.user.id)  // Ownership check
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // 4. Check tier limits
  validateTierLimit(...)

  // 5. Proceed with operation
  ...
}
```

## Vulnerability Prevention

### SQL Injection
- ✅ **Prevented** - Using Supabase client (prepared statements)
- ✅ **No raw SQL** with user input

### XSS (Cross-Site Scripting)
- ✅ **Prevented** - React auto-escaping + input validation
- ✅ **HTML tags blocked** in all text inputs

### CSRF (Cross-Site Request Forgery)
- ✅ **Prevented** - SameSite cookies + origin validation

### Injection Attacks
- ✅ **Prevented** - Zod validation + sanitization
- ✅ **Whitespace trimmed** from all inputs

### DoS (Denial of Service)
- ✅ **Length limits** on all inputs (prevents large payloads)
- ✅ **Tier limits** prevent resource exhaustion
- ⚠️ **Rate limiting** - To be added in production (Vercel Edge Config)

### Broken Authentication
- ✅ **Secure password hashing** (bcrypt via Supabase)
- ✅ **Email verification** required
- ✅ **Session management** with auto-refresh

### Sensitive Data Exposure
- ✅ **Environment variables** gitignored
- ✅ **API keys** server-side only
- ✅ **HTTPS enforced** in production (Vercel)

## Security Checklist for Production

Before deploying to production, ensure:

- [ ] All environment variables set in Vercel
- [ ] Email verification enabled in Supabase
- [ ] HTTPS redirect enabled (Vercel does this automatically)
- [ ] Content Security Policy headers configured
- [ ] Rate limiting enabled (Vercel Edge Config or Upstash Redis)
- [ ] Error tracking enabled (Sentry)
- [ ] Database backups enabled (Supabase auto-backup)
- [ ] Monitoring and alerting configured
- [ ] Security audit completed
- [ ] Penetration testing performed (optional but recommended)

## Reporting Security Issues

If you discover a security vulnerability, please email: **[your-security-email@example.com]**

Do NOT open a public GitHub issue for security vulnerabilities.

## Security Updates

This document is updated as new security measures are implemented or threats are identified.

**Last Updated:** 2026-01-05
**Version:** 1.0
