import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to AI SEO Platform!</h1>
          <p className="mt-2 text-gray-600">Let's get your account set up in just 5 simple steps.</p>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Onboarding Wizard</h2>
              <p className="text-gray-600">Coming soon: 5-step onboarding process</p>
              <ul className="mt-4 text-left max-w-md mx-auto space-y-2 text-sm text-gray-600">
                <li>✓ Step 1: Add your website</li>
                <li>✓ Step 2: Add keywords to track</li>
                <li>✓ Step 3: Add competitors (optional)</li>
                <li>✓ Step 4: Run first AI check</li>
                <li>✓ Step 5: Complete setup</li>
              </ul>
            </div>

            <div className="text-center pt-6">
              <a
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Skip to Dashboard (for now)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
