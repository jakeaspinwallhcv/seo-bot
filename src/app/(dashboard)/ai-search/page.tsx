import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserKeywordsWithAIChecks } from '@/lib/api/ai-search'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { AISearchPageClient } from '@/components/ai-search/ai-search-page-client'

export default async function AISearchPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch keywords with AI search check history
  const keywords = await getUserKeywordsWithAIChecks(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardNav
        currentPage="ai-search"
        userEmail={user.email || ''}
        profile={profile}
      />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AISearchPageClient keywords={keywords} />
      </main>
    </div>
  )
}
