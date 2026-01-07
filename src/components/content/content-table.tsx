'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { FileTextIcon, TrashIcon, EyeIcon } from 'lucide-react'
import type { GeneratedContentItem } from '@/lib/api/content'
import { ContentViewerModal } from './content-viewer-modal'
import { StatusDropdown } from './status-dropdown'
import { ConfirmationModal } from '../ui/confirmation-modal'

type ContentTableProps = {
  content: GeneratedContentItem[]
}

export function ContentTable({ content: initialContent }: ContentTableProps) {
  const [content, setContent] = useState(initialContent)
  const [viewingContent, setViewingContent] = useState<GeneratedContentItem | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [deletingContent, setDeletingContent] = useState<GeneratedContentItem | null>(null)

  const handleStatusChange = async (contentId: string, newStatus: string) => {
    setLoading(contentId)

    try {
      const response = await fetch('/api/content/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status')
      }

      // Update local state
      setContent((prev) =>
        prev.map((item) =>
          item.id === contentId ? { ...item, status: newStatus } : item
        )
      )

      toast.success('Status updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!deletingContent) return

    setLoading(deletingContent.id)

    try {
      const response = await fetch('/api/content/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: deletingContent.id }),
      })

      if (!response.ok) {
        const error = await response.json()

        // Handle stale data case
        if (error.error?.includes('not found')) {
          toast.error(
            'This content has already been deleted. Refreshing page...',
            { duration: 3000 }
          )
          // Refresh page after 2 seconds
          setTimeout(() => window.location.reload(), 2000)
          return
        }

        throw new Error(error.error || 'Failed to delete content')
      }

      // Remove from local state
      setContent((prev) => prev.filter((item) => item.id !== deletingContent.id))

      toast.success(`Deleted "${deletingContent.title}" successfully`)
      setDeletingContent(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete content')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keyword
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {content.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {item.hero_image_url ? (
                      <img
                        src={item.hero_image_url}
                        alt={item.title}
                        className="h-12 w-20 object-cover rounded mr-3 flex-shrink-0"
                        onError={(e) => {
                          // Hide image and show icon if image fails to load
                          e.currentTarget.style.display = 'none'
                          const icon = e.currentTarget.nextElementSibling
                          if (icon) icon.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <FileTextIcon className={`h-5 w-5 text-gray-400 mr-3 flex-shrink-0 ${item.hero_image_url ? 'hidden' : ''}`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {item.word_count && (
                          <span className="text-xs text-gray-500">
                            {item.word_count} words
                          </span>
                        )}
                        {item.suggested_keywords && item.suggested_keywords.length > 0 && (
                          <>
                            <span className="text-xs text-gray-400">·</span>
                            <div className="flex flex-wrap gap-1">
                              {item.suggested_keywords.slice(0, 3).map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                                >
                                  {keyword}
                                </span>
                              ))}
                              {item.suggested_keywords.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{item.suggested_keywords.length - 3}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item.keywords?.keyword || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 capitalize">
                    {item.content_type.replace('_', ' ')}
                  </div>
                  {item.estimated_reading_time && (
                    <div className="text-xs text-gray-400">
                      {item.estimated_reading_time} min read
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusDropdown
                    currentStatus={item.status as any}
                    onChange={(newStatus) => handleStatusChange(item.id, newStatus)}
                    disabled={loading === item.id}
                    size="sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(item.created_at), {
                    addSuffix: true,
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setViewingContent(item)}
                      disabled={loading === item.id}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      title="View content"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingContent(item)}
                      disabled={loading === item.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Delete content"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Content Viewer Modal */}
      {viewingContent && (
        <ContentViewerModal
          isOpen={viewingContent !== null}
          onClose={() => setViewingContent(null)}
          content={viewingContent}
          onUpdate={(updatedContent) => {
            // Update the content in local state
            setContent((prev) =>
              prev.map((item) =>
                item.id === updatedContent.id ? updatedContent : item
              )
            )
            setViewingContent(updatedContent)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingContent && (
        <ConfirmationModal
          isOpen={deletingContent !== null}
          onClose={() => !loading && setDeletingContent(null)}
          onConfirm={handleDelete}
          title="Delete Content"
          message={`Are you sure you want to delete "${deletingContent.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={loading === deletingContent.id}
        />
      )}
    </div>
  )
}
