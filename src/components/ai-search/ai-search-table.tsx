'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { RefreshCwIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from 'lucide-react'
import { AISearchResultsModal } from './ai-search-results-modal'

type AICheck = {
  id: string
  platform: string
  query: string
  is_cited: boolean
  response_text: string
  citation_context?: string | null
  checked_at: string
}

type KeywordWithAIChecks = {
  id: string
  keyword: string
  project_id: string
  created_at: string
  projects: {
    id: string
    name: string
    domain: string
  }
  ai_search_checks: AICheck[]
  latestChecks: AICheck[]
  citationRate: number
  lastChecked: string | null
}

type AISearchTableProps = {
  keywords: KeywordWithAIChecks[]
}

export function AISearchTable({ keywords }: AISearchTableProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordWithAIChecks | null>(null)

  const handleCheckAI = async (keywordId: string) => {
    setLoading(keywordId)

    try {
      const response = await fetch('/api/ai-search/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywordId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to check AI citation')
      }

      const result = await response.json()

      // Store success message for after reload
      sessionStorage.setItem('toast', JSON.stringify({
        type: 'success',
        message: `AI check complete! Citation rate: ${result.summary.citationRate}% (${result.summary.cited}/${result.summary.total} platforms)`
      }))

      // Refresh to show new data
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to check AI citation')
      setLoading(null)
    }
  }

  const getCitationBadge = (citationRate: number, lastChecked: string | null) => {
    if (!lastChecked) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Not checked
        </span>
      )
    }

    if (citationRate === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="h-3 w-3 mr-1" />
          0% cited
        </span>
      )
    }

    if (citationRate === 100) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          100% cited
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        {citationRate}% cited
      </span>
    )
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keyword
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Citation Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checked
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {keywords.map((keyword) => (
                <tr key={keyword.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {keyword.keyword}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {keyword.projects.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {keyword.projects.domain}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCitationBadge(keyword.citationRate, keyword.lastChecked)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {keyword.lastChecked
                      ? formatDistanceToNow(new Date(keyword.lastChecked), {
                          addSuffix: true,
                        })
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleCheckAI(keyword.id)}
                        disabled={loading === keyword.id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        title="Check AI citation"
                      >
                        <RefreshCwIcon
                          className={`h-4 w-4 ${loading === keyword.id ? 'animate-spin' : ''}`}
                        />
                      </button>
                      {keyword.ai_search_checks.length > 0 && (
                        <button
                          onClick={() => setSelectedKeyword(keyword)}
                          disabled={loading === keyword.id}
                          className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                          title="View details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Modal */}
      {selectedKeyword && (
        <AISearchResultsModal
          isOpen={selectedKeyword !== null}
          onClose={() => setSelectedKeyword(null)}
          keyword={selectedKeyword}
        />
      )}
    </>
  )
}
