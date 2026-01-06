'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { AISearchTable } from './ai-search-table'
import { BrainCircuitIcon } from 'lucide-react'
import type { KeywordWithAIChecks } from '@/lib/api/ai-search'

type AISearchPageClientProps = {
  keywords: KeywordWithAIChecks[]
}

export function AISearchPageClient({ keywords }: AISearchPageClientProps) {
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
            <h2 className="text-2xl font-bold text-gray-900">AI Search Tracking</h2>
            <p className="mt-1 text-sm text-gray-600">
              Check if your website is mentioned in AI chatbot responses
            </p>
          </div>
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
