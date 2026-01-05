'use client'

import { useState } from 'react'
import { sanitizeDomain, type CompetitorsFormData } from '@/lib/validations/onboarding'

type StepThreeProps = {
  projectId: string
  onComplete: (data: CompetitorsFormData) => void
  onBack: () => void
}

export function StepThree({ projectId, onComplete, onBack }: StepThreeProps) {
  const [competitors, setCompetitors] = useState<string[]>([])
  const [competitorInput, setCompetitorInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAddCompetitor = () => {
    if (!competitorInput.trim()) return

    // Security: Sanitize domain
    const cleanDomain = sanitizeDomain(competitorInput)

    if (!cleanDomain) {
      setError('Please enter a valid domain')
      return
    }

    if (competitors.includes(cleanDomain)) {
      setError('This competitor is already added')
      return
    }

    if (competitors.length >= 3) {
      setError('Maximum 3 competitors allowed')
      return
    }

    setCompetitors((prev) => [...prev, cleanDomain])
    setCompetitorInput('')
    setError(null)
  }

  const handleRemoveCompetitor = (index: number) => {
    setCompetitors((prev) => prev.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    onComplete({ competitors })
  }

  const handleSkip = () => {
    onComplete({ competitors: [] })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add Competitors (Optional)</h2>
        <p className="mt-2 text-sm text-gray-600">
          Track up to 3 competitor websites to see how you compare. You can skip this step and add them later.
        </p>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="competitor" className="block text-sm font-medium text-gray-700">
            Competitor Domain
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="competitor"
              type="text"
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="competitor.com"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCompetitor()
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCompetitor}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter domain without http:// or www
          </p>
        </div>

        {competitors.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Added Competitors ({competitors.length}/3)
            </label>
            <div className="space-y-2">
              {competitors.map((competitor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                >
                  <span className="text-sm text-gray-900">{competitor}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCompetitor(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={competitors.length === 0}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
