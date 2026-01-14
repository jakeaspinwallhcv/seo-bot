import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDashboardStats, getRecentActivity, getRankTrendData } from '@/lib/api/dashboard'
import { DashboardNav } from '@/components/layout/dashboard-nav'
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
  const rankTrendData = await getRankTrendData(session.user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardNav
        currentPage="dashboard"
        userEmail={session.user.email || ''}
        profile={profile}
      />

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
              <RankTrendChart data={rankTrendData} />
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
