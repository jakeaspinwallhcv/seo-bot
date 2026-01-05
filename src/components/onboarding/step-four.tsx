'use client'

import { useState } from 'react'

type StepFourProps = {
  projectId: string
  keywords: string[]
  domain: string
  onComplete: () => void
  onBack: () => void
}

export function StepFour({ projectId, keywords, domain, onComplete, onBack }: StepFourProps) {
  const [checking, setChecking] = useState(false)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<{ keyword: string; cited: boolean }[]>([])

  const handleRunCheck = async () => {
    setChecking(true)

    // Simulate AI check (will be replaced with real API calls in Days 18-21)
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock results - randomly show some as cited
    const mockResults = keywords.slice(0, 2).map((keyword) => ({
      keyword,
      cited: Math.random() > 0.5,
    }))

    setResults(mockResults)
    setChecked(true)
    setChecking(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Run Your First AI Check</h2>
        <p className="mt-2 text-sm text-gray-600">
          Let's see if your website appears in AI search results! We'll check your first 2 keywords.
        </p>
      </div>

      <div className="space-y-6">
        {!checked && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  What is an AI Check?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    We'll query AI platforms (Claude, ChatGPT) with your keywords to see if they mention your website ({domain}) in their responses. This helps you understand your AI search visibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {checking && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-sm text-gray-600">
              Checking AI platforms... This may take a few moments.
            </p>
          </div>
        )}

        {checked && results.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Results</h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {result.keyword}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Checked in Claude & ChatGPT
                    </p>
                  </div>
                  <div>
                    {result.cited ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Cited
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not cited
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a simulated check for the onboarding. Real AI checks will be available starting in Days 18-21 when we integrate the AI platform APIs.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={checking}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Back
          </button>
          {!checked ? (
            <button
              type="button"
              onClick={handleRunCheck}
              disabled={checking}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? 'Checking...' : 'Run AI Check'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
