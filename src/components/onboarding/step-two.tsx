'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { parseKeywordInput } from '@/lib/validations/onboarding'
import { TIER_LIMITS } from '@/lib/utils/tier-limits'

type StepTwoProps = {
  projectId: string
  onComplete: (data: { keywords: string[] }) => void
  onBack: () => void
}

export function StepTwo({ projectId, onComplete, onBack }: StepTwoProps) {
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])

  const handleAddKeywords = () => {
    if (!keywordInput.trim()) return

    setWarning(null)

    // Security: Parse and sanitize keywords
    const newKeywords = parseKeywordInput(keywordInput)

    // Combine with existing
    const combined = [...keywords, ...newKeywords]

    // Remove duplicates (case-insensitive)
    const unique = Array.from(
      new Map(combined.map((k) => [k.toLowerCase(), k])).values()
    )

    // Check if limit exceeded
    if (unique.length > TIER_LIMITS.free.keywords) {
      setWarning(
        `Free tier allows maximum ${TIER_LIMITS.free.keywords} keywords. Only the first ${TIER_LIMITS.free.keywords} will be added.`
      )
      setKeywords(unique.slice(0, TIER_LIMITS.free.keywords))
    } else {
      setKeywords(unique)
    }

    setKeywordInput('')
  }

  const handleRemoveKeyword = (index: number) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index))
    setWarning(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate we have keywords
      if (keywords.length === 0) {
        throw new Error('Please add at least 1 keyword')
      }

      if (keywords.length > TIER_LIMITS.free.keywords) {
        throw new Error(`Free tier allows maximum ${TIER_LIMITS.free.keywords} keywords`)
      }

      const supabase = createClient()

      // Security: Insert keywords with proper validation
      const keywordInserts = keywords.map((keyword) => ({
        project_id: projectId,
        keyword: keyword.trim(),
        target_url: null,
        search_volume: null,
        difficulty_score: null,
        tags: [],
      }))

      const { error: insertError } = await supabase
        .from('keywords')
        .insert(keywordInserts)

      if (insertError) {
        console.error('Keyword insert error:', insertError)

        // Handle duplicate keyword error
        if (insertError.code === '23505') {
          throw new Error('Some keywords are already added to this project')
        }

        throw new Error('Failed to add keywords. Please try again.')
      }

      // Success - move to next step
      onComplete({ keywords })
    } catch (err: any) {
      console.error('Step two error:', err)
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add Keywords to Track</h2>
        <p className="mt-2 text-sm text-gray-600">
          Add up to {TIER_LIMITS.free.keywords} keywords you want to track for this website.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {warning && (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="text-sm text-yellow-800">{warning}</div>
          </div>
        )}

        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
            Keywords
          </label>
          <div className="mt-1 flex gap-2">
            <textarea
              id="keywords"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              rows={3}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Enter keywords (one per line or comma-separated)&#10;e.g.&#10;real estate agent austin&#10;best homes in austin"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleAddKeywords()
                }
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Press Cmd+Enter to add keywords
            </p>
            <button
              type="button"
              onClick={handleAddKeywords}
              disabled={keywords.length >= TIER_LIMITS.free.keywords}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Keywords
            </button>
          </div>
        </div>

        {/* Keywords list */}
        {keywords.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Added Keywords ({keywords.length}/{TIER_LIMITS.free.keywords})
              </label>
              {keywords.length >= TIER_LIMITS.free.keywords && (
                <span className="text-xs text-yellow-600 font-medium">
                  Limit reached
                </span>
              )}
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
              {keywords.map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                >
                  <span className="text-sm text-gray-900">{keyword}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(index)}
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
          <button
            type="submit"
            disabled={loading || keywords.length === 0}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  )
}
