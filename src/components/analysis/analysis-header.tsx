'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Project = {
  id: string
  name: string
  domain: string
}

type AnalysisHeaderProps = {
  project: Project
}

export function AnalysisHeader({ project }: AnalysisHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
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
                className="inline-flex items-center px-3 py-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Keywords
              </a>
              <a
                href="/analysis"
                className="inline-flex items-center px-3 py-2 border-b-2 border-blue-500 text-sm font-medium text-gray-900"
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
            <span className="text-sm text-gray-700">{project.name}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-700 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
