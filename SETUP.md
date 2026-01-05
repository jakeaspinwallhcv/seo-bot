# Setup Instructions

## Current Status: Days 6-7 Complete ✅

Authentication and interactive 5-step onboarding wizard are built and ready to test!

## Step 1: Run Database Migration

You need to create the database tables in your Supabase project.

**Option A: Using Supabase Dashboard (Easiest)**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Copy the entire contents of `supabase/migrations/20260105000000_initial_schema.sql`
5. Paste into the SQL Editor
6. Click "Run" (bottom right)
7. You should see "Success. No rows returned" message

**Option B: Using Supabase CLI**
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
npx supabase login

# Link to your project (get project ref from dashboard URL)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migration
npx supabase db push
```

## Step 2: Configure Email Settings (Optional)

By default, Supabase sends confirmation emails. To test locally without email:

1. Go to Supabase Dashboard → Authentication → Providers
2. Scroll to "Email"
3. **Disable "Confirm email"** for local testing (you can enable it later)
4. Click "Save"

This lets you sign up and immediately log in without email verification.

## Step 3: Test Authentication Flow

### Start the dev server:
```bash
npm run dev
```

### Test the complete flow:

1. **Visit landing page**: http://localhost:3000
   - Should show the landing page

2. **Go to signup**: http://localhost:3000/signup
   - Enter your name, email, and password (min 8 chars)
   - Click "Sign up"
   - If email confirmation is disabled: you'll see success message
   - If email confirmation is enabled: check your email and click the link

3. **Login**: http://localhost:3000/login
   - Enter your email and password
   - Click "Sign in"
   - Should redirect to /onboarding

4. **Onboarding**: http://localhost:3000/onboarding
   - **Step 1**: Add your website/project
     - Enter project name (e.g., "My Real Estate Business")
     - Enter domain (e.g., "example.com")
     - Click "Next"
   - **Step 2**: Add keywords
     - Enter 1-5 keywords (one per line or comma-separated)
     - Click "Add Keywords" or press Cmd+Enter
     - Review added keywords and click "Next"
   - **Step 3**: Add competitors (optional)
     - Enter up to 3 competitor domains
     - Or click "Skip" to continue
   - **Step 4**: Run first AI check
     - Click "Run AI Check" to simulate checking AI platforms
     - View mock results (real API integration coming in Days 18-21)
     - Click "Next"
   - **Step 5**: Setup complete
     - Review what you've set up
     - Click "Go to Dashboard"

5. **Dashboard**: http://localhost:3000/dashboard
   - Should see your name/email in the header
   - See 4 stat cards (all showing 0 for now)
   - See getting started checklist

6. **Sign out**: Click "Sign out" in the dashboard header
   - Should redirect to /login

## Step 4: Verify Database

After signing up, check your Supabase database:

1. Go to Supabase Dashboard → Table Editor
2. Click on "profiles" table
3. You should see your user record with:
   - Your email
   - Your full name
   - subscription_tier: "free"
   - created_at timestamp

## What's Working Now

✅ **Authentication**
- Email/password signup
- Email/password login
- Email verification (if enabled)
- Protected routes (dashboard, onboarding)
- Session management
- Sign out

✅ **Database**
- Full schema with RLS policies
- User profiles auto-created on signup
- Tables for: projects, keywords, rank_checks, ai_search_checks, generated_content, usage_tracking

✅ **Onboarding Wizard**
- 5-step interactive wizard
- Form validation with Zod
- Input sanitization (prevents XSS)
- Tier limit enforcement (free: 1 project, 5 keywords)
- Domain validation and sanitization
- Keyword parsing (comma/newline separated)
- Simulated AI check (real integration coming Days 18-21)

✅ **Security**
- Input validation on all forms
- XSS prevention (HTML tag blocking)
- Tier limits enforced server-side
- Row-Level Security (RLS) policies
- See SECURITY.md for full details

✅ **Testing**
- Jest + React Testing Library configured
- Tests for tier limits utility
- Run tests with: `npm test`

## Next Steps (Days 6-30)

After you've tested authentication, we'll continue with:

- **Days 6-7**: Build out the 5-step onboarding wizard
- **Days 8-10**: Complete the dashboard UI with charts
- **Days 11-13**: Keyword management (add/edit/delete keywords)
- **Days 14-17**: Traditional rank tracking with DataForSEO
- **Days 18-21**: AI search tracking (Claude + ChatGPT)
- **Days 22-25**: Content generation with Claude
- **Days 26-30**: Polish, testing, and deployment

## Troubleshooting

### "Invalid JWT" or "Session expired"
- Clear browser cookies
- Make sure your .env.local has the correct Supabase credentials
- Restart the dev server

### Can't access dashboard
- Make sure you're logged in
- Check that middleware.ts is working (should redirect to /login if not authenticated)

### "User already registered"
- The email is already in use
- Try logging in instead of signing up
- Or use a different email

### Database errors
- Make sure you ran the migration (Step 1)
- Check Supabase Dashboard → Database → Tables to verify tables exist
- Check that RLS is enabled on all tables

## Environment Variables Checklist

In your `.env.local` file, you should have:

- [x] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- [ ] `ANTHROPIC_API_KEY` - Not needed yet (Days 18+)
- [ ] `OPENAI_API_KEY` - Not needed yet (Days 18+)
- [ ] `DATAFORSEO_LOGIN` - Not needed yet (Days 14+)
- [ ] `DATAFORSEO_PASSWORD` - Not needed yet (Days 14+)
- [ ] `RESEND_API_KEY` - Not needed yet (optional)

Only the Supabase variables are required right now!
