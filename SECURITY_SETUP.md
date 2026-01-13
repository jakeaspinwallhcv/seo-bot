# Security Configuration

This document outlines security configurations that need to be set up in Supabase Dashboard.

## Database Security Fixes

### SQL Function Security (search_path)

**Status:** ✅ Fixed via migration

**What was fixed:**
- `public.handle_new_user()` - Added `SET search_path = ''`
- `public.update_updated_at_column()` - Added `SET search_path = ''`

**How to apply:**
Run the migration in Supabase SQL Editor:
```sql
-- File: supabase/migrations/20260113000000_fix_security_warnings.sql
```

**Why this matters:**
Setting an immutable `search_path` prevents search path hijacking attacks where a malicious user could create objects in a schema that's earlier in the search path, potentially causing the function to execute unintended code.

## Auth Configuration

### Leaked Password Protection

**Status:** ⚠️ Requires manual setup in Supabase Dashboard

**What it does:**
Supabase Auth can check passwords against the HaveIBeenPwned.org database to prevent users from using compromised passwords. This is a free service that checks password hashes against billions of known leaked passwords.

**How to enable:**

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Click "Authentication" in the left sidebar
   - Click "Policies" or "Settings" tab

3. **Enable Leaked Password Protection**
   - Look for "Password Protection" or "Security" section
   - Toggle on "Check against HaveIBeenPwned database"
   - Save changes

**Benefits:**
- Prevents users from using passwords that have been exposed in data breaches
- No performance impact (checks are done via k-anonymity protocol)
- Improves overall account security
- Industry best practice for authentication

**Technical Details:**
- Uses k-anonymity protocol (only first 5 characters of password hash are sent)
- No actual passwords are transmitted
- Database contains 800+ million compromised passwords
- Checks happen during signup and password change

## Additional Security Recommendations

### Row-Level Security (RLS)

**Status:** ✅ Already implemented

All tables have RLS enabled with proper policies:
- Users can only access their own data
- Tenant isolation via user_id checks
- No cross-tenant data leakage

### API Key Management

**Status:** ⚠️ Verify environment variables are secure

Ensure these are set correctly:
- `NEXT_PUBLIC_SUPABASE_URL` - Can be public
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Can be public (RLS protects data)
- `ANTHROPIC_API_KEY` - Must be secret (server-side only)
- `OPENAI_API_KEY` - Must be secret (server-side only)

**Best practices:**
- Never commit `.env.local` or `.env` files to git
- Use environment variables in production (Vercel, Render, etc.)
- Rotate API keys if compromised
- Use different keys for dev/staging/production

### HTTPS Enforcement

**Status:** ✅ Handled by deployment platform

Both Vercel and Render automatically enforce HTTPS for all connections.

### SQL Injection Prevention

**Status:** ✅ Using Supabase client SDK

All database queries use Supabase's client library which:
- Uses parameterized queries
- Prevents SQL injection by design
- No raw SQL queries in application code

### CORS Configuration

**Status:** ✅ Configured via Supabase Dashboard

Supabase automatically handles CORS for your domain. Verify in Dashboard:
- Authentication > URL Configuration
- Ensure your production domain is listed
- Remove any unnecessary domains

## Security Monitoring

### Recommended Tools

1. **Supabase Database Linter**
   - Built-in tool in Supabase Dashboard
   - Checks for common security issues
   - Run regularly (at least monthly)

2. **GitHub Dependabot**
   - Already enabled for this repo
   - Automatically creates PRs for dependency updates
   - Includes security vulnerability alerts

3. **Supabase Auth Logs**
   - Monitor for suspicious login attempts
   - Track failed authentication attempts
   - Available in Supabase Dashboard > Authentication > Logs

## Incident Response

If you discover a security issue:

1. **Immediate Actions**
   - Rotate affected API keys
   - Review access logs in Supabase Dashboard
   - Check for unauthorized database changes

2. **Investigation**
   - Review authentication logs
   - Check for data exfiltration
   - Identify scope of compromise

3. **Remediation**
   - Apply security patches
   - Notify affected users if data was compromised
   - Update security documentation

4. **Prevention**
   - Document the incident
   - Update security measures
   - Conduct security review

## Compliance Considerations

### GDPR/Privacy
- User data is stored in Supabase (choose region wisely)
- Implement data retention policies
- Provide data export functionality
- Honor deletion requests

### Data Encryption
- At rest: ✅ Supabase encrypts all data
- In transit: ✅ HTTPS enforced
- Backups: ✅ Encrypted by Supabase

## Security Checklist

Before going to production:

- [x] RLS policies enabled on all tables
- [x] SQL functions have immutable search_path
- [ ] Leaked password protection enabled in Auth settings
- [ ] Production environment variables set securely
- [ ] CORS configured for production domain only
- [ ] SSL/HTTPS enforced (automatic on Vercel/Render)
- [ ] Database backups enabled (Supabase Pro plan)
- [ ] Monitoring and alerting configured
- [ ] Security contact information documented
- [ ] Incident response plan documented

## References

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
