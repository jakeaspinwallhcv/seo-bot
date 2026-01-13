# Setup Supabase Service Role Key

## Why This Is Needed

The website analysis feature runs in the background and needs to write to the database without a user session. The **service role key** bypasses Row Level Security (RLS) and allows server-side operations to access the database.

## How to Get Your Service Role Key

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard

2. **Select your project**

3. **Navigate to Settings**:
   - Click on "Settings" in the left sidebar
   - Click on "API" submenu

4. **Find the Service Role Key**:
   - Scroll down to the "Project API keys" section
   - Look for **"service_role"** key
   - Click the "Copy" button or "Reveal" to see the full key
   - It should start with `eyJ...` and be very long

## Update Your .env.local File

1. Open `.env.local` in your project root

2. Find this line:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. Replace `your-service-role-key` with your actual service role key:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Save the file

5. **Restart your development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

## Security Warning ⚠️

**IMPORTANT**: The service role key is extremely powerful and bypasses all RLS policies.

- ✅ **DO**: Use it only in server-side code
- ✅ **DO**: Keep it in `.env.local` (already in `.gitignore`)
- ✅ **DO**: Use it for background tasks and admin operations
- ❌ **DON'T**: Expose it to the frontend
- ❌ **DON'T**: Commit it to Git
- ❌ **DON'T**: Share it publicly

## Verify It Works

After setting up the key:

1. Restart your dev server
2. Go to the Analysis page
3. Click "Start Analysis"
4. Wait 30-60 seconds
5. Refresh the page
6. You should now see:
   - Status: "completed"
   - Pages listed in the table
   - Issues displayed
   - SEO scores

If you still see "in_progress" forever, check the terminal for error messages.

## Troubleshooting

**If you see "Missing SUPABASE_SERVICE_ROLE_KEY":**
- Make sure you added the key to `.env.local`
- Make sure you restarted the dev server
- Make sure there are no typos

**If you see "SUPABASE_SERVICE_ROLE_KEY is set to placeholder value":**
- You haven't replaced the placeholder with your actual key
- Get the real key from Supabase Dashboard

**If analysis still fails:**
- Check terminal logs for specific error messages
- Verify your key is correct (starts with `eyJ`)
- Make sure you copied the **service_role** key, not the anon key
