'use client'

import { useState } from 'react'
import { XIcon, FileTextIcon, LayoutIcon, PackageIcon } from 'lucide-react'

type GenerateContentModalProps = {
  isOpen: boolean
  onClose: () => void
  keyword: string
  onGenerate: (contentType: string, targetWordCount: number, includeHeroImage: boolean) => void
  isLoading: boolean
}

const CONTENT_TYPES = [
  {
    value: 'blog_post',
    label: 'Blog Post',
    icon: FileTextIcon,
    description: 'In-depth article optimized for SEO and engagement',
    defaultWords: 1500,
    examples: ['How-to guides', 'Industry insights', 'Educational content'],
  },
  {
    value: 'landing_page',
    label: 'Landing Page',
    icon: LayoutIcon,
    description: 'Conversion-focused page copy with clear CTAs',
    defaultWords: 800,
    examples: ['Service pages', 'Product launches', 'Lead magnets'],
  },
  {
    value: 'product_description',
    label: 'Product Description',
    icon: PackageIcon,
    description: 'Detailed product copy highlighting benefits and features',
    defaultWords: 500,
    examples: ['Property listings', 'Service descriptions', 'Feature pages'],
  },
]

const WORD_COUNT_OPTIONS = [
  { value: 500, label: '500 words (Quick)' },
  { value: 800, label: '800 words (Medium)' },
  { value: 1500, label: '1,500 words (Standard)' },
  { value: 2500, label: '2,500 words (Comprehensive)' },
]

export function GenerateContentModal({
  isOpen,
  onClose,
  keyword,
  onGenerate,
  isLoading,
}: GenerateContentModalProps) {
  const [selectedType, setSelectedType] = useState<string>('blog_post')
  const [wordCount, setWordCount] = useState<number>(1500)
  const [includeHeroImage, setIncludeHeroImage] = useState<boolean>(false)

  if (!isOpen) return null

  const handleGenerate = () => {
    onGenerate(selectedType, wordCount, includeHeroImage)
  }

  const selectedTypeConfig = CONTENT_TYPES.find((t) => t.value === selectedType)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 transition-opacity" />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Generate Content
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Keyword: <span className="font-medium">{keyword}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Content Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Content Type
              </label>
              <div className="grid grid-cols-1 gap-3">
                {CONTENT_TYPES.map((type) => {
                  const Icon = type.icon
                  const isSelected = selectedType === type.value

                  return (
                    <button
                      key={type.value}
                      onClick={() => {
                        setSelectedType(type.value)
                        setWordCount(type.defaultWords)
                      }}
                      disabled={isLoading}
                      className={`relative flex items-start p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div
                        className={`flex-shrink-0 ${
                          isSelected ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`text-sm font-medium ${
                              isSelected ? 'text-blue-900' : 'text-gray-900'
                            }`}
                          >
                            {type.label}
                          </h3>
                          {isSelected && (
                            <div className="ml-2 flex-shrink-0">
                              <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 12 12"
                                >
                                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        <p
                          className={`text-sm mt-1 ${
                            isSelected ? 'text-blue-700' : 'text-gray-500'
                          }`}
                        >
                          {type.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {type.examples.map((example, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                isSelected
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Word Count Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Word Count
              </label>
              <div className="grid grid-cols-2 gap-3">
                {WORD_COUNT_OPTIONS.map((option) => {
                  const isSelected = wordCount === option.value

                  return (
                    <button
                      key={option.value}
                      onClick={() => setWordCount(option.value)}
                      disabled={isLoading}
                      className={`px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Hero Image Option */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeHeroImage}
                  onChange={(e) => setIncludeHeroImage(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">
                  <span className="font-medium">Generate AI hero image</span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Create a unique, photorealistic image using DALL-E 3 (~$0.04 per image). Uncheck if you have your own images.
                  </span>
                </span>
              </label>
            </div>

            {/* Estimated Time */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Estimated generation time:</span>
                <span className="font-medium text-gray-900">
                  {wordCount >= 2000 ? '3-5 minutes' : wordCount >= 1000 ? '2-3 minutes' : '1-2 minutes'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Includes:</span>
                <span className="font-medium text-gray-900">
                  AI-generated hero image
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⚙️</span>
                  Generating...
                </>
              ) : (
                `Generate ${selectedTypeConfig?.label}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
