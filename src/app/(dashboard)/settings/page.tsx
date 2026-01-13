import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { CrawlerExclusions } from '@/components/settings/crawler-exclusions'

export default async function SettingsPage() {
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

  // Get user's project
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', session.user.id)
    .limit(1)

  const project = projects?.[0]

  if (!project) {
    redirect('/onboarding')
  }

  // Get exclusion patterns
  const { data: patterns } = await supabase
    .from('crawler_exclusion_patterns')
    .select('*')
    .eq('project_id', project.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <DashboardNav
        currentPage="settings"
        userEmail={session.user.email || ''}
        profile={profile}
      />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="mt-1 text-sm text-gray-600">
            Configure crawler settings and URL exclusion patterns for {project.domain}
          </p>
        </div>

        {/* Settings sections */}
        <div className="space-y-6">
          {/* Crawler Exclusions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              URL Exclusion Patterns
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Configure which URLs should be excluded from crawling. Use * to match any characters and ? to match a single character.
            </p>
            <CrawlerExclusions projectId={project.id} patterns={patterns || []} />
          </div>

          {/* Future: Add more settings sections here */}
          {/* - Crawler settings (max pages, timeouts, etc.) */}
          {/* - Notification preferences */}
          {/* - Integration settings */}
        </div>
      </main>
    </div>
  )
}
