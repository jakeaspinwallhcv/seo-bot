import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserKeywords } from '@/lib/api/keywords'
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

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AI SEO Platform</h1>
              <div className="ml-6 flex space-x-4">
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-3 py-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Dashboard
                </a>
                <a
                  href="/keywords"
                  className="inline-flex items-center px-3 py-2 border-b-2 border-blue-500 text-sm font-medium text-gray-900"
                >
                  Keywords
                </a>
                <a
                  href="/analysis"
                  className="inline-flex items-center px-3 py-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Analysis
                </a>
                <a
                  href="/ai-search"
                  className="inline-flex items-center px-3 py-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  AI Search
                </a>
                <a
                  href="/content"
                  className="inline-flex items-center px-3 py-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Content
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {profile?.full_name || session.user.email}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {profile?.subscription_tier || 'free'}
              </span>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

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
