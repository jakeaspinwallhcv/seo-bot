'use client'

import { useState } from 'react'
import { XIcon } from 'lucide-react'

type AddKeywordModalProps = {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
}

export function AddKeywordModal({
  isOpen,
  onClose,
  projectId,
  projectName,
}: AddKeywordModalProps) {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!keyword.trim()) {
      alert('Please enter a keyword')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/keywords/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, keyword }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add keyword')
      }

      // Refresh the page to show new keyword
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add keyword')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add Keyword</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={loading}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 border border-gray-300">
                {projectName}
              </div>
            </div>

            <div>
              <label
                htmlFor="keyword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Keyword
              </label>
              <input
                id="keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., real estate agent miami"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 placeholder-gray-400"
                disabled={loading}
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter a keyword to track rankings for
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Keyword'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
