'use client'

import { XIcon, ExternalLinkIcon } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

type RankCheck = {
  rank: number | null
  checked_at: string
  url?: string | null
  title?: string | null
  serp_features?: {
    featured_snippet: boolean
    people_also_ask: boolean
    local_pack: boolean
    knowledge_graph: boolean
    image_pack: boolean
    video_pack: boolean
  }
}

type RankHistoryModalProps = {
  isOpen: boolean
  onClose: () => void
  keyword: string
  rankChecks: RankCheck[]
}

export function RankHistoryModal({
  isOpen,
  onClose,
  keyword,
  rankChecks,
}: RankHistoryModalProps) {
  if (!isOpen) return null

  const getSerpFeatureBadge = (feature: string, isPresent: boolean) => {
    if (!isPresent) return null

    const labels: Record<string, string> = {
      featured_snippet: 'Featured Snippet',
      people_also_ask: 'People Also Ask',
      local_pack: 'Local Pack',
      knowledge_graph: 'Knowledge Graph',
      image_pack: 'Images',
      video_pack: 'Videos',
    }

    return (
      <span
        key={feature}
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
      >
        {labels[feature]}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Rank History</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tracking: <span className="font-medium text-gray-900">{keyword}</span>
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
          {rankChecks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No rank checks yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Click "Check Rank" to run your first rank check
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rankChecks.map((check, index) => {
                const rankChange =
                  index < rankChecks.length - 1 && check.rank !== null && rankChecks[index + 1].rank !== null
                    ? (rankChecks[index + 1].rank as number) - (check.rank as number)
                    : null

                return (
                  <div
                    key={check.checked_at}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Rank and change */}
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-2xl font-bold text-gray-900">
                            {check.rank !== null ? `#${check.rank}` : 'Not ranked'}
                          </div>
                          {rankChange !== null && (
                            <div
                              className={`text-sm font-medium ${
                                rankChange > 0
                                  ? 'text-green-600'
                                  : rankChange < 0
                                  ? 'text-red-600'
                                  : 'text-gray-500'
                              }`}
                            >
                              {rankChange > 0 ? '+' : ''}
                              {rankChange} from previous
                            </div>
                          )}
                        </div>

                        {/* URL and title */}
                        {check.url && (
                          <div className="mb-2">
                            <a
                              href={check.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center"
                            >
                              {check.title || check.url}
                              <ExternalLinkIcon className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        )}

                        {/* SERP features */}
                        {check.serp_features && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {Object.entries(check.serp_features).map(([feature, isPresent]) =>
                              getSerpFeatureBadge(feature, isPresent)
                            )}
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="text-xs text-gray-500">
                          {format(new Date(check.checked_at), 'MMM d, yyyy h:mm a')} (
                          {formatDistanceToNow(new Date(check.checked_at), { addSuffix: true })})
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
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
