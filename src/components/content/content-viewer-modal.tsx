'use client'

import { useState } from 'react'
import { XIcon, ExternalLinkIcon, CopyIcon, EditIcon, SaveIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import type { GeneratedContentItem } from '@/lib/api/content'
import ReactMarkdown from 'react-markdown'
import { StatusDropdown } from './status-dropdown'

type ContentViewerModalProps = {
  isOpen: boolean
  onClose: () => void
  content: GeneratedContentItem
  onUpdate?: (updatedContent: GeneratedContentItem) => void
}

export function ContentViewerModal({
  isOpen,
  onClose,
  content,
  onUpdate,
}: ContentViewerModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedTitle, setEditedTitle] = useState(content.title)
  const [editedContent, setEditedContent] = useState(content.content)
  const [editedMetaDescription, setEditedMetaDescription] = useState(content.meta_description || '')
  const [imageError, setImageError] = useState(false)

  if (!isOpen) return null

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch('/api/content/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: content.id, status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status')
      }

      toast.success('Status updated successfully')

      // Update parent component if callback provided
      if (onUpdate) {
        onUpdate({ ...content, status: newStatus })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  const handleSaveEdit = async () => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/content/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: content.id,
          title: editedTitle,
          content: editedContent,
          metaDescription: editedMetaDescription,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update content')
      }

      toast.success('Content updated successfully')
      setIsEditing(false)

      // Update parent component if callback provided
      if (onUpdate) {
        onUpdate({
          ...content,
          title: editedTitle,
          content: editedContent,
          meta_description: editedMetaDescription,
          word_count: editedContent.split(/\s+/).length,
        })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update content')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedTitle(content.title)
    setEditedContent(content.content)
    setEditedMetaDescription(content.meta_description || '')
    setIsEditing(false)
  }

  const handleCopyContent = () => {
    navigator.clipboard.writeText(content.content)
    toast.success('Content copied to clipboard')
  }

  const handleCopyHTML = () => {
    // Convert markdown to basic HTML for copying
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="description" content="${content.meta_description || ''}">
  <title>${content.title}</title>
</head>
<body>
  <article>
    <h1>${content.title}</h1>
    ${content.hero_image_url ? `<img src="${content.hero_image_url}" alt="${content.title}">` : ''}
    ${content.content}
  </article>
</body>
</html>`

    navigator.clipboard.writeText(htmlContent)
    toast.success('HTML copied to clipboard')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-xl font-semibold text-gray-900 border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900">
                    {content.title}
                  </h2>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Created {formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}
                  {content.keywords?.keyword && (
                    <> · Keyword: <span className="font-medium">{content.keywords.keyword}</span></>
                  )}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Status and Edit Controls */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <StatusDropdown
                  currentStatus={content.status as any}
                  onChange={handleStatusChange}
                  disabled={isSaving}
                  size="md"
                />
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <SaveIcon className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <EditIcon className="h-4 w-4" />
                  Edit Content
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {/* Hero Image */}
            {content.hero_image_url && !imageError && (
              <div className="mb-6">
                <img
                  src={content.hero_image_url}
                  alt={content.title}
                  className="w-full h-auto rounded-lg"
                  onError={() => setImageError(true)}
                />
              </div>
            )}
            {content.hero_image_url && imageError && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Hero image failed to load. DALL-E URLs expire after a few hours.
                  Consider uploading your own image or regenerating the content.
                </p>
              </div>
            )}

            {/* Meta Description */}
            {(content.meta_description || isEditing) && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Meta Description
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedMetaDescription}
                    onChange={(e) => setEditedMetaDescription(e.target.value)}
                    rows={2}
                    maxLength={160}
                    className="w-full text-sm text-gray-900 border border-blue-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter meta description (150-160 characters)"
                  />
                ) : (
                  <p className="text-sm text-blue-700">{content.meta_description}</p>
                )}
                {isEditing && (
                  <p className="text-xs text-blue-600 mt-1">
                    {editedMetaDescription.length}/160 characters
                  </p>
                )}
              </div>
            )}

            {/* Keywords */}
            {content.suggested_keywords && content.suggested_keywords.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Suggested Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {content.suggested_keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {isEditing ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Content (Markdown)
                </label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={20}
                  className="w-full text-sm text-gray-900 border border-gray-300 rounded px-3 py-2 font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter content in markdown format..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editedContent.split(/\s+/).length} words
                </p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-table:text-gray-700">
                <ReactMarkdown
                  components={{
                  // Add proper spacing between paragraphs
                  p: ({ children }) => <p className="mb-4">{children}</p>,
                  // Style headings with proper spacing
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-6">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold mb-3 mt-4">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-base font-semibold mb-2 mt-4">{children}</h4>,
                  // Style lists with proper spacing
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  // Style links
                  a: ({ href, children }) => (
                    <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  // Style tables
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                  tbody: ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>,
                  tr: ({ children }) => <tr>{children}</tr>,
                  th: ({ children }) => (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => <td className="px-4 py-2 text-sm text-gray-700">{children}</td>,
                  // Style blockquotes
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 italic text-gray-600">
                      {children}
                    </blockquote>
                  ),
                  // Style code blocks
                  code: ({ children }) => (
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 p-4 rounded mb-4 overflow-x-auto">
                      {children}
                    </pre>
                  ),
                }}
              >
                {content.content}
              </ReactMarkdown>
              </div>
            )}

            {/* Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex gap-4 text-sm text-gray-500">
              {content.word_count && (
                <div>
                  <span className="font-medium">{content.word_count}</span> words
                </div>
              )}
              {content.estimated_reading_time && (
                <div>
                  <span className="font-medium">{content.estimated_reading_time}</span> min read
                </div>
              )}
              <div className="capitalize">
                Type: <span className="font-medium">{content.content_type.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleCopyContent}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <CopyIcon className="h-4 w-4 mr-2" />
                Copy Markdown
              </button>
              <button
                onClick={handleCopyHTML}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Copy HTML
              </button>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
