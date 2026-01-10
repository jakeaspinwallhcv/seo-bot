import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserKeywords } from '@/lib/api/keywords'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { KeywordTable } from '@/components/keywords/keyword-table'
import { KeywordsPageClient } from '@/components/keywords/keywords-page-client'
import { HashIcon } from 'lucide-react'
import { TIER_LIMITS } from '@/lib/utils/tier-limits'

export default async function KeywordsPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Fetch user's project
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('user_id', session.user.id)
    .single()

  // Fetch keywords
  const keywords = await getUserKeywords(session.user.id)

  const tier = (profile?.subscription_tier || 'free') as keyof typeof TIER_LIMITS
  const keywordLimit = TIER_LIMITS[tier].keywords

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardNav
        currentPage="keywords"
        userEmail={session.user.email || ''}
        profile={profile}
      />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <KeywordsPageClient
          keywords={keywords}
          keywordLimit={keywordLimit}
          project={project}
        />
      </main>
    </div>
  )
}
