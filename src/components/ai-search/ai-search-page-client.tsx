'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { AISearchTable } from './ai-search-table'
import { BrainCircuitIcon, RefreshCwIcon } from 'lucide-react'
import type { KeywordWithAIChecks } from '@/lib/api/ai-search'

type AISearchPageClientProps = {
  keywords: KeywordWithAIChecks[]
}

export function AISearchPageClient({ keywords }: AISearchPageClientProps) {
  const [checkingAll, setCheckingAll] = useState(false)

  // Check for toast messages after page reload
  useEffect(() => {
    const toastData = sessionStorage.getItem('toast')
    if (toastData) {
      try {
        const { type, message } = JSON.parse(toastData)
        if (type === 'success') {
          toast.success(message)
        } else if (type === 'error') {
          toast.error(message)
        }
        sessionStorage.removeItem('toast')
      } catch (error) {
        console.error('Failed to parse toast data:', error)
      }
    }
  }, [])

  const handleCheckAllAICitations = async () => {
    if (keywords.length === 0) {
      toast.error('No keywords to check')
      return
    }

    setCheckingAll(true)

    try {
      const response = await fetch('/api/ai-search/check-all', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to check AI citations')
      }

      const result = await response.json()

      // Store success message for after reload
      const message =
        result.failed > 0
          ? `Checked ${result.successful}/${result.total} keywords. ${result.failed} failed.`
          : `Successfully checked all ${result.successful} keywords!`

      sessionStorage.setItem(
        'toast',
        JSON.stringify({
          type: result.failed > 0 ? 'error' : 'success',
          message,
        })
      )

      // Refresh to show new data
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to check AI citations')
      setCheckingAll(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Search Tracking</h2>
            <p className="mt-1 text-sm text-gray-600">
              Check if your website is mentioned in AI chatbot responses
            </p>
          </div>
          {keywords.length > 0 && (
            <button
              onClick={handleCheckAllAICitations}
              disabled={checkingAll}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Check AI citations for all keywords"
            >
              <RefreshCwIcon
                className={`h-4 w-4 mr-2 ${checkingAll ? 'animate-spin' : ''}`}
              />
              {checkingAll ? 'Checking...' : 'Check All AI Citations'}
            </button>
          )}
        </div>
      </div>

      {keywords.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <BrainCircuitIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No keywords yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Add keywords first to start tracking AI citations
            </p>
            <a
              href="/keywords"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Keywords
            </a>
          </div>
        </div>
      ) : (
        <AISearchTable keywords={keywords} />
      )}
    </>
  )
}
