import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDashboardStats, getRecentActivity } from '@/lib/api/dashboard'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RankTrendChart } from '@/components/dashboard/rank-trend-chart'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import {
  HashIcon,
  FolderIcon,
  TrendingUpIcon,
  FileTextIcon,
} from 'lucide-react'

export default async function DashboardPage() {
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

  // Fetch dashboard data
  const stats = await getDashboardStats(session.user.id)
  const activities = await getRecentActivity(session.user.id, 10)

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
                  className="inline-flex items-center px-3 py-2 border-b-2 border-blue-500 text-sm font-medium text-gray-900"
                >
                  Dashboard
                </a>
                <a
                  href="/keywords"
                  className="inline-flex items-center px-3 py-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Keywords
                </a>
                <a
                  href="#"
                  className="inline-flex items-center px-3 py-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  AI Search
                </a>
                <a
                  href="#"
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your SEO performance
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Projects"
            value={stats.totalProjects}
            subtitle={`${stats.totalProjects}/1 used`}
            icon={<FolderIcon className="h-6 w-6 text-blue-600" />}
          />

          <StatsCard
            title="Total Keywords"
            value={stats.totalKeywords}
            subtitle={`Tracking across all projects`}
            icon={<HashIcon className="h-6 w-6 text-green-600" />}
          />

          <StatsCard
            title="Average Rank"
            value={stats.averageRank !== null ? `#${stats.averageRank}` : '-'}
            subtitle={
              stats.averageRank !== null
                ? 'Across tracked keywords'
                : 'No rank data yet'
            }
            icon={<TrendingUpIcon className="h-6 w-6 text-purple-600" />}
          />

          <StatsCard
            title="AI Citation Rate"
            value={`${stats.aiCitationRate}%`}
            subtitle={`AI platforms mention you`}
            icon={<FileTextIcon className="h-6 w-6 text-orange-600" />}
          />
        </div>

        {/* Charts and activity section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rank trend chart */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Ranking Trend
                </h3>
                <span className="text-xs text-gray-500">Last 30 days</span>
              </div>
              <RankTrendChart data={[]} />
            </div>
          </div>

          {/* Recent activity */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <ActivityFeed activities={activities} />
            </div>
          </div>
        </div>

        {/* Getting started section - show if no keywords */}
        {stats.totalKeywords === 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Get Started
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              You've completed onboarding! Here's what you can do next:
            </p>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>
                  Your project is set up with {stats.totalKeywords} keywords
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <span>Run your first rank check (coming in Days 14-17)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🤖</span>
                <span>Monitor AI platform citations (coming in Days 18-21)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✍️</span>
                <span>Generate SEO content (coming in Days 22-25)</span>
              </li>
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
