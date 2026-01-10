import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalysisHeader } from '@/components/analysis/analysis-header'
import { AnalysisOverview } from '@/components/analysis/analysis-overview'
import { IssuesList } from '@/components/analysis/issues-list'
import { PagesList } from '@/components/analysis/pages-list'

export default async function AnalysisPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

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

  // Get latest analysis for this project
  const { data: latestAnalysis } = await supabase
    .from('website_analyses')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Get all analyses for history
  const { data: analysisHistory } = await supabase
    .from('website_analyses')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // If we have an analysis, get its issues and pages
  let issues = []
  let pages = []

  if (latestAnalysis) {
    const { data: issuesData } = await supabase
      .from('seo_issues')
      .select('*')
      .eq('analysis_id', latestAnalysis.id)
      .order('severity', { ascending: true }) // critical first

    const { data: pagesData } = await supabase
      .from('crawled_pages')
      .select('*')
      .eq('analysis_id', latestAnalysis.id)
      .order('url', { ascending: true })

    issues = issuesData || []
    pages = pagesData || []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <AnalysisHeader project={project} />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Website Analysis</h2>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive SEO analysis for {project.domain}
          </p>
        </div>

        {/* Show analysis overview if we have data */}
        {latestAnalysis ? (
          <div className="space-y-8">
            <AnalysisOverview
              analysis={latestAnalysis}
              project={project}
              history={analysisHistory || []}
            />

            {/* Issues section */}
            {issues.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  SEO Issues ({issues.length})
                </h3>
                <IssuesList issues={issues} />
              </div>
            )}

            {/* Pages section */}
            {pages.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Crawled Pages ({pages.length})
                </h3>
                <PagesList pages={pages} />
              </div>
            )}
          </div>
        ) : (
          /* Empty state - no analysis yet */
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No analysis yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Start your first SEO analysis to see comprehensive insights about your
                website's performance.
              </p>
              <form action="/api/analysis/start" method="POST" className="mt-6">
                <input type="hidden" name="projectId" value={project.id} />
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Start Analysis
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
