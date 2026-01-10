'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Profile = {
  full_name: string | null
  subscription_tier: string | null
}

type DashboardNavProps = {
  currentPage: 'dashboard' | 'keywords' | 'analysis' | 'ai-search' | 'content'
  userEmail: string
  profile: Profile | null
}

export function DashboardNav({
  currentPage,
  userEmail,
  profile,
}: DashboardNavProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'keywords', label: 'Keywords', href: '/keywords' },
    { id: 'analysis', label: 'Analysis', href: '/analysis' },
    { id: 'ai-search', label: 'AI Search', href: '/ai-search' },
    { id: 'content', label: 'Content', href: '/content' },
  ] as const

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">AI SEO Platform</h1>
            <div className="ml-6 flex space-x-4">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                    currentPage === item.id
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {profile?.full_name || userEmail}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {profile?.subscription_tier || 'free'}
            </span>
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
