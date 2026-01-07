'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import type { KeywordWithProject } from '@/lib/api/keywords'
import { RankHistoryModal } from './rank-history-modal'
import { GenerateContentModal } from './generate-content-modal'
import {
  PencilIcon,
  TrashIcon,
  RefreshCwIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  HistoryIcon,
  FileTextIcon,
} from 'lucide-react'

type KeywordTableProps = {
  keywords: KeywordWithProject[]
}

export function KeywordTable({ keywords: initialKeywords }: KeywordTableProps) {
  const [keywords, setKeywords] = useState(initialKeywords)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [historyKeyword, setHistoryKeyword] = useState<KeywordWithProject | null>(null)
  const [generatingKeyword, setGeneratingKeyword] = useState<KeywordWithProject | null>(null)

  const handleEdit = (keyword: KeywordWithProject) => {
    setEditingId(keyword.id)
    setEditValue(keyword.keyword)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleSaveEdit = async (keywordId: string) => {
    if (!editValue.trim()) {
      toast.error('Keyword cannot be empty')
      return
    }

    setLoading(keywordId)

    try {
      const response = await fetch('/api/keywords/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywordId, keyword: editValue }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update keyword')
      }

      // Store success message for after reload
      sessionStorage.setItem('toast', JSON.stringify({
        type: 'success',
        message: 'Keyword updated successfully'
      }))

      // Refresh the page to get updated data from server
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update keyword')
      setLoading(null)
    }
  }

  const handleDelete = async (keywordId: string, keyword: string) => {
    if (!confirm(`Are you sure you want to delete "${keyword}"?`)) {
      return
    }

    setLoading(keywordId)

    try {
      const response = await fetch('/api/keywords/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywordId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete keyword')
      }

      // Store success message for after reload
      sessionStorage.setItem('toast', JSON.stringify({
        type: 'success',
        message: `Deleted "${keyword}" successfully`
      }))

      // Refresh the page to get updated data from server
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete keyword')
      setLoading(null)
    }
  }

  const handleCheckRank = async (keywordId: string) => {
    setLoading(keywordId)

    try {
      const response = await fetch('/api/keywords/check-rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywordId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to check rank')
      }

      const { rank } = await response.json()

      // Update local state with new rank
      setKeywords((prev) =>
        prev.map((kw) => {
          if (kw.id === keywordId) {
            const previousRank = kw.latestRank
            const rankChange =
              previousRank !== null && rank !== null
                ? previousRank - rank
                : null

            return {
              ...kw,
              latestRank: rank,
              previousRank,
              rankChange,
              rank_checks: [
                { rank, checked_at: new Date().toISOString() },
                ...kw.rank_checks,
              ],
            }
          }
          return kw
        })
      )

      toast.success(
        `Rank check complete! Current rank: ${rank !== null ? `#${rank}` : 'Not ranked'}`
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to check rank')
    } finally {
      setLoading(null)
    }
  }

  const handleGenerateContent = async (contentType: string, targetWordCount: number, includeHeroImage: boolean) => {
    if (!generatingKeyword) return

    setLoading(generatingKeyword.id)

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywordId: generatingKeyword.id,
          contentType,
          targetWordCount,
          includeHeroImage,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate content')
      }

      // Store success message for after navigation
      sessionStorage.setItem(
        'toast',
        JSON.stringify({
          type: 'success',
          message: `Content generated for "${generatingKeyword.keyword}"! View it on the Content page.`,
        })
      )

      // Navigate to content page
      window.location.href = '/content'
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate content')
      setLoading(null)
    }
  }

  const getRankChangeIndicator = (rankChange: number | null) => {
    if (rankChange === null) {
      return (
        <span className="inline-flex items-center text-gray-400">
          <MinusIcon className="h-4 w-4" />
        </span>
      )
    }

    if (rankChange > 0) {
      // Positive change = rank improved (lower number)
      return (
        <span className="inline-flex items-center text-green-600">
          <ArrowUpIcon className="h-4 w-4" />
          <span className="ml-1 text-sm font-medium">{rankChange}</span>
        </span>
      )
    }

    if (rankChange < 0) {
      // Negative change = rank worsened (higher number)
      return (
        <span className="inline-flex items-center text-red-600">
          <ArrowDownIcon className="h-4 w-4" />
          <span className="ml-1 text-sm font-medium">{Math.abs(rankChange)}</span>
        </span>
      )
    }

    return (
      <span className="inline-flex items-center text-gray-400">
        <MinusIcon className="h-4 w-4" />
      </span>
    )
  }

  return (
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
                Current Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
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
                  {editingId === keyword.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 placeholder-gray-400"
                      autoFocus
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900">
                      {keyword.keyword}
                    </div>
                  )}
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
                  <div className="text-sm font-medium text-gray-900">
                    {keyword.latestRank !== null
                      ? `#${keyword.latestRank}`
                      : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRankChangeIndicator(keyword.rankChange)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {keyword.rank_checks.length > 0
                    ? formatDistanceToNow(
                        new Date(keyword.rank_checks[0].checked_at),
                        { addSuffix: true }
                      )
                    : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === keyword.id ? (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleSaveEdit(keyword.id)}
                        disabled={loading === keyword.id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={loading === keyword.id}
                        className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleCheckRank(keyword.id)}
                        disabled={loading === keyword.id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        title="Check rank"
                      >
                        <RefreshCwIcon
                          className={`h-4 w-4 ${loading === keyword.id ? 'animate-spin' : ''}`}
                        />
                      </button>
                      <button
                        onClick={() => setHistoryKeyword(keyword)}
                        disabled={loading === keyword.id}
                        className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                        title="View history"
                      >
                        <HistoryIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setGeneratingKeyword(keyword)}
                        disabled={loading === keyword.id}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        title="Generate content"
                      >
                        <FileTextIcon
                          className={`h-4 w-4 ${loading === keyword.id ? 'animate-pulse' : ''}`}
                        />
                      </button>
                      <button
                        onClick={() => handleEdit(keyword)}
                        disabled={loading === keyword.id}
                        className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        title="Edit keyword"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(keyword.id, keyword.keyword)}
                        disabled={loading === keyword.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Delete keyword"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rank History Modal */}
      {historyKeyword && (
        <RankHistoryModal
          isOpen={historyKeyword !== null}
          onClose={() => setHistoryKeyword(null)}
          keyword={historyKeyword.keyword}
          rankChecks={historyKeyword.rank_checks}
        />
      )}

      {/* Generate Content Modal */}
      {generatingKeyword && (
        <GenerateContentModal
          isOpen={generatingKeyword !== null}
          onClose={() => {
            if (loading !== generatingKeyword.id) {
              setGeneratingKeyword(null)
            }
          }}
          keyword={generatingKeyword.keyword}
          onGenerate={handleGenerateContent}
          isLoading={loading === generatingKeyword.id}
        />
      )}
    </div>
  )
}
