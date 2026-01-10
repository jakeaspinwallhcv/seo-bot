'use client'

import { useState } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from 'lucide-react'

type Page = {
  id: string
  url: string
  title: string | null
  meta_description: string | null
  h1: string | null
  status_code: number
  word_count: number | null
  load_time_ms: number | null
  has_robots_meta: boolean
  is_indexable: boolean
  has_og_tags: boolean
  has_schema_markup: boolean
  total_images: number
  images_without_alt: number
  internal_links: number
  external_links: number
  broken_links: number
}

type PagesListProps = {
  pages: Page[]
}

export function PagesList({ pages }: PagesListProps) {
  const [expandedPage, setExpandedPage] = useState<string | null>(null)

  const toggleExpanded = (pageId: string) => {
    setExpandedPage(expandedPage === pageId ? null : pageId)
  }

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600'
    if (statusCode >= 300 && statusCode < 400) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-2">
      {pages.map((page) => (
        <div key={page.id} className="border border-gray-200 rounded-lg">
          {/* Page header */}
          <button
            onClick={() => toggleExpanded(page.id)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {expandedPage === page.id ? (
                <ChevronDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {page.title || 'No title'}
                </div>
                <div className="text-xs text-gray-500 truncate">{page.url}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className={`text-sm font-medium ${getStatusColor(page.status_code)}`}
              >
                {page.status_code}
              </span>
              {page.is_indexable ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-600" />
              )}
            </div>
          </button>

          {/* Expanded details */}
          {expandedPage === page.id && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* SEO Elements */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">SEO Elements</h5>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Title</span>
                      <span className="text-gray-900">
                        {page.title ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Meta Description</span>
                      <span className="text-gray-900">
                        {page.meta_description ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">H1 Tag</span>
                      <span className="text-gray-900">{page.h1 ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Open Graph Tags</span>
                      <span className="text-gray-900">
                        {page.has_og_tags ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Schema Markup</span>
                      <span className="text-gray-900">
                        {page.has_schema_markup ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Metrics */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    Content Metrics
                  </h5>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Word Count</span>
                      <span className="text-gray-900">
                        {page.word_count ?? '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Load Time</span>
                      <span className="text-gray-900">
                        {page.load_time_ms ? `${page.load_time_ms}ms` : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Images</span>
                      <span className="text-gray-900">{page.total_images}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Images w/o Alt</span>
                      <span
                        className={
                          page.images_without_alt > 0
                            ? 'text-red-600 font-medium'
                            : 'text-gray-900'
                        }
                      >
                        {page.images_without_alt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Links</h5>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Internal Links</span>
                      <span className="text-gray-900">
                        {page.internal_links}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">External Links</span>
                      <span className="text-gray-900">
                        {page.external_links}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Broken Links</span>
                      <span
                        className={
                          page.broken_links > 0
                            ? 'text-red-600 font-medium'
                            : 'text-gray-900'
                        }
                      >
                        {page.broken_links}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Indexing</h5>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Indexable</span>
                      <span className="text-gray-900">
                        {page.is_indexable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Robots Meta</span>
                      <span className="text-gray-900">
                        {page.has_robots_meta ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* View page button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  View Page
                  <ExternalLinkIcon className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
