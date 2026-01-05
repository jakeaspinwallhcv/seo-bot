import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AI SEO Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {profile?.full_name || session.user.email}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-600">
            Welcome to your AI SEO tracking dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stats cards placeholder */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Keywords
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Rank
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">-</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    AI Citation Rate
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">0%</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Content Generated
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Getting Started</h3>
          <p className="text-gray-600 mb-4">
            Your account is set up! Here's what you can do next:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✅ Account created and verified</li>
            <li>📋 Add your first project (coming in Days 3-5)</li>
            <li>🔑 Add keywords to track (coming in Days 11-13)</li>
            <li>📈 Check traditional search rankings (coming in Days 14-17)</li>
            <li>🤖 Monitor AI search citations (coming in Days 18-21)</li>
            <li>✍️ Generate SEO content (coming in Days 22-25)</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
