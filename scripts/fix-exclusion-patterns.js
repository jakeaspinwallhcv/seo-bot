#!/usr/bin/env node
/**
 * Fix overly aggressive exclusion patterns for real estate websites
 * Disables patterns that block legitimate listing pages
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseKey === 'your-service-role-key') {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not configured');
  console.error('Please follow the instructions in SETUP_SERVICE_KEY.md first');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPatterns() {
  console.log('🔍 Finding problematic exclusion patterns...\n');

  // Patterns that should be disabled for real estate sites
  const patternsToDisable = [
    '*/listings/*',
    '*/listing/*',
  ];

  for (const pattern of patternsToDisable) {
    const { data, error } = await supabase
      .from('crawler_exclusion_patterns')
      .update({ is_active: false })
      .eq('pattern', pattern)
      .eq('is_default', true)
      .select('id, pattern, project_id');

    if (error) {
      console.error(`❌ Error disabling pattern "${pattern}":`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ Disabled pattern: "${pattern}" (${data.length} projects)`);
    } else {
      console.log(`ℹ️  Pattern "${pattern}" not found or already disabled`);
    }
  }

  console.log('\n✅ Done! Your listing pages will now be crawled.');
  console.log('\nNext steps:');
  console.log('1. Go to http://localhost:3000/analysis');
  console.log('2. Click "Start Analysis" again');
  console.log('3. Wait 30-60 seconds');
  console.log('4. Refresh the page');
  console.log('5. You should now see pages in the table!');
}

fixPatterns().catch(console.error);
