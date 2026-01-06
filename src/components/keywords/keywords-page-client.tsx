'use client'

import { useState } from 'react'
import { KeywordTable } from './keyword-table'
import { AddKeywordModal } from './add-keyword-modal'
import { HashIcon, PlusIcon } from 'lucide-react'
import type { KeywordWithProject } from '@/lib/api/keywords'

type KeywordsPageClientProps = {
  keywords: KeywordWithProject[]
  keywordLimit: number
  project: { id: string; name: string } | null
}

export function KeywordsPageClient({
  keywords,
  keywordLimit,
  project,
}: KeywordsPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const canAddKeyword = keywords.length < keywordLimit && project !== null
  const isAtLimit = keywords.length >= keywordLimit

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Keywords</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage and track your keyword rankings
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {keywords.length} / {keywordLimit} keywords used
            </span>
            {project && (
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={isAtLimit}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                  isAtLimit
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'text-white bg-blue-600 hover:bg-blue-700'
                }`}
                title={
                  isAtLimit
                    ? 'You have reached your keyword limit. Upgrade to add more.'
                    : 'Add a new keyword'
                }
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Keyword
              </button>
            )}
          </div>
        </div>
        {isAtLimit && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              You've reached your keyword limit.{' '}
              {/* TODO: Link to billing page when implemented */}
              <a href="#" className="font-medium underline hover:text-yellow-900">
                Upgrade
              </a>{' '}
              to add more keywords.
            </p>
          </div>
        )}
      </div>

      {keywords.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <HashIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No keywords yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Get started by adding your first keyword to track rankings.
            </p>
            {project && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Keyword
              </button>
            )}
          </div>
        </div>
      ) : (
        <KeywordTable keywords={keywords} />
      )}

      {project && (
        <AddKeywordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectId={project.id}
          projectName={project.name}
        />
      )}
    </>
  )
}
