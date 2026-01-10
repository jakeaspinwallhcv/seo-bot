import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserContent } from '@/lib/api/content'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { ContentPageClient } from '@/components/content/content-page-client'

export default async function ContentPage() {
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

  // Fetch generated content
  const content = await getUserContent(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardNav
        currentPage="content"
        userEmail={user.email || ''}
        profile={profile}
      />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContentPageClient content={content} />
      </main>
    </div>
  )
}
