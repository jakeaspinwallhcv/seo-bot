'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ContentTable } from './content-table'
import { FileTextIcon } from 'lucide-react'
import type { GeneratedContentItem } from '@/lib/api/content'

type ContentPageClientProps = {
  content: GeneratedContentItem[]
}

export function ContentPageClient({ content }: ContentPageClientProps) {
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

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI-Generated Content</h2>
            <p className="mt-1 text-sm text-gray-600">
              Create SEO-optimized content powered by Claude AI
            </p>
          </div>
        </div>
      </div>

      {content.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <FileTextIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No content yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Generate your first AI-powered content from your keywords
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
        <ContentTable content={content} />
      )}
    </>
  )
}
