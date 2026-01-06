'use client'

import { XIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

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
  ai_search_checks: AICheck[]
}

type AISearchResultsModalProps = {
  isOpen: boolean
  onClose: () => void
  keyword: KeywordWithAIChecks
}

export function AISearchResultsModal({
  isOpen,
  onClose,
  keyword,
}: AISearchResultsModalProps) {
  if (!isOpen) return null

  const getPlatformName = (platform: string) => {
    const names: Record<string, string> = {
      claude: 'Claude (Anthropic)',
      chatgpt: 'ChatGPT (OpenAI)',
      perplexity: 'Perplexity',
      gemini: 'Gemini (Google)',
    }
    return names[platform] || platform
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">AI Search Results</h3>
            <p className="mt-1 text-sm text-gray-500">
              Keyword: <span className="font-medium text-gray-900">{keyword.keyword}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {keyword.ai_search_checks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No AI search checks yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Click "Check AI Citation" to run your first check
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {keyword.ai_search_checks.map((check) => (
                <div
                  key={check.id}
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                >
                  {/* Platform and status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        {getPlatformName(check.platform)}
                      </h4>
                      {check.is_cited ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Cited
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Not Cited
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(check.checked_at), 'MMM d, yyyy h:mm a')} (
                      {formatDistanceToNow(new Date(check.checked_at), { addSuffix: true })})
                    </div>
                  </div>

                  {/* Query */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Query</h5>
                    <p className="text-sm text-gray-900 bg-white rounded px-3 py-2 border border-gray-200">
                      {check.query}
                    </p>
                  </div>

                  {/* Citation context if cited */}
                  {check.is_cited && check.citation_context && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Citation Context
                      </h5>
                      <p className="text-sm text-gray-900 bg-green-50 rounded px-3 py-2 border border-green-200">
                        {check.citation_context}
                      </p>
                    </div>
                  )}

                  {/* Full response */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Full Response
                    </h5>
                    <div className="text-sm text-gray-900 bg-white rounded px-3 py-2 border border-gray-200 max-h-64 overflow-y-auto whitespace-pre-wrap">
                      {check.response_text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
