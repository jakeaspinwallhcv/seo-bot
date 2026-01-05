'use client'

type StepFiveProps = {
  projectName: string
  keywordCount: number
  onComplete: () => void
}

export function StepFive({ projectName, keywordCount, onComplete }: StepFiveProps) {
  return (
    <div>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          You're All Set!
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to your AI SEO tracking platform
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          What you've set up:
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <svg
              className="h-6 w-6 text-green-500 mr-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Project: {projectName}
              </p>
              <p className="text-xs text-gray-500">Your website is being tracked</p>
            </div>
          </li>
          <li className="flex items-start">
            <svg
              className="h-6 w-6 text-green-500 mr-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {keywordCount} Keywords
              </p>
              <p className="text-xs text-gray-500">
                Ready to track in search engines and AI platforms
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <svg
              className="h-6 w-6 text-green-500 mr-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">First AI Check Complete</p>
              <p className="text-xs text-gray-500">
                You can run more checks from your dashboard
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h4 className="text-sm font-medium text-blue-900 mb-2">What's next?</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>View your dashboard to see keyword tracking stats</li>
          <li>Check traditional search rankings (Days 14-17)</li>
          <li>Monitor AI platform citations (Days 18-21)</li>
          <li>Generate SEO-optimized content (Days 22-25)</li>
        </ul>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
