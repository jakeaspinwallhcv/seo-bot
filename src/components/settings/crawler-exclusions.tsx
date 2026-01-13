'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X, Plus, Loader2 } from 'lucide-react'

type Pattern = {
  id: string
  project_id: string
  pattern: string
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

type CrawlerExclusionsProps = {
  projectId: string
  patterns: Pattern[]
}

export function CrawlerExclusions({
  projectId,
  patterns: initialPatterns,
}: CrawlerExclusionsProps) {
  const [patterns, setPatterns] = useState<Pattern[]>(initialPatterns)
  const [newPattern, setNewPattern] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const router = useRouter()

  const defaultPatterns = patterns.filter((p) => p.is_default)
  const customPatterns = patterns.filter((p) => !p.is_default)

  const handleAddPattern = async () => {
    if (!newPattern.trim()) {
      toast.error('Pattern cannot be empty')
      return
    }

    setIsAdding(true)

    try {
      const response = await fetch('/api/exclusion-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          pattern: newPattern.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add pattern')
      }

      const { pattern } = await response.json()
      setPatterns([...patterns, pattern])
      setNewPattern('')
      toast.success('Pattern added successfully')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add pattern')
    } finally {
      setIsAdding(false)
    }
  }

  const handleTogglePattern = async (patternId: string, isActive: boolean) => {
    setLoadingIds(new Set(loadingIds).add(patternId))

    try {
      const response = await fetch(`/api/exclusion-patterns/${patternId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update pattern')
      }

      setPatterns(
        patterns.map((p) => (p.id === patternId ? { ...p, is_active: isActive } : p))
      )
      toast.success(isActive ? 'Pattern enabled' : 'Pattern disabled')
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update pattern'
      )
    } finally {
      const newLoadingIds = new Set(loadingIds)
      newLoadingIds.delete(patternId)
      setLoadingIds(newLoadingIds)
    }
  }

  const handleDeletePattern = async (patternId: string) => {
    if (!confirm('Are you sure you want to delete this pattern?')) {
      return
    }

    setLoadingIds(new Set(loadingIds).add(patternId))

    try {
      const response = await fetch(`/api/exclusion-patterns/${patternId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete pattern')
      }

      setPatterns(patterns.filter((p) => p.id !== patternId))
      toast.success('Pattern deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete pattern'
      )
    } finally {
      const newLoadingIds = new Set(loadingIds)
      newLoadingIds.delete(patternId)
      setLoadingIds(newLoadingIds)
    }
  }

  return (
    <div className="space-y-6">
      {/* Default patterns */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Default Exclusions
        </h4>
        <p className="text-xs text-gray-500 mb-3">
          These patterns are automatically applied to all projects. You can enable or disable them as needed.
        </p>
        <div className="space-y-2">
          {defaultPatterns.map((pattern) => (
            <div
              key={pattern.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50"
            >
              <code className="text-sm font-mono text-gray-700">
                {pattern.pattern}
              </code>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pattern.is_active}
                  onChange={(e) =>
                    handleTogglePattern(pattern.id, e.target.checked)
                  }
                  disabled={loadingIds.has(pattern.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {loadingIds.has(pattern.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : pattern.is_active ? (
                    'Enabled'
                  ) : (
                    'Disabled'
                  )}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Custom patterns */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Custom Exclusions
        </h4>
        <p className="text-xs text-gray-500 mb-3">
          Add your own exclusion patterns specific to your website.
        </p>

        {/* Add new pattern */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="e.g., */listings/*, *.pdf, /404"
            value={newPattern}
            onChange={(e) => setNewPattern(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddPattern()
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleAddPattern}
            disabled={isAdding || !newPattern.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </button>
        </div>

        {/* Help text */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-xs text-blue-800">
            <strong>Pattern Syntax:</strong> Use <code className="bg-blue-100 px-1 rounded">*</code> to match any characters, <code className="bg-blue-100 px-1 rounded">?</code> to match a single character.
          </p>
          <ul className="mt-2 text-xs text-blue-700 list-disc list-inside space-y-1">
            <li><code className="bg-blue-100 px-1 rounded">*/admin/*</code> - Excludes all admin pages</li>
            <li><code className="bg-blue-100 px-1 rounded">*.pdf</code> - Excludes all PDF files</li>
            <li><code className="bg-blue-100 px-1 rounded">/404</code> - Excludes the 404 page</li>
            <li><code className="bg-blue-100 px-1 rounded">*/listings/*</code> - Excludes all listing pages</li>
          </ul>
        </div>

        {/* Custom patterns list */}
        {customPatterns.length > 0 ? (
          <div className="space-y-2">
            {customPatterns.map((pattern) => (
              <div
                key={pattern.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
              >
                <code className="text-sm font-mono text-gray-700">
                  {pattern.pattern}
                </code>
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pattern.is_active}
                      onChange={(e) =>
                        handleTogglePattern(pattern.id, e.target.checked)
                      }
                      disabled={loadingIds.has(pattern.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {loadingIds.has(pattern.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : pattern.is_active ? (
                        'Enabled'
                      ) : (
                        'Disabled'
                      )}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeletePattern(pattern.id)}
                    disabled={loadingIds.has(pattern.id)}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    title="Delete pattern"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No custom patterns yet. Add one above to get started.
          </p>
        )}
      </div>
    </div>
  )
}
