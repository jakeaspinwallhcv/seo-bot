'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react'
import { AnalysisStatusListener } from './analysis-status-listener'

type Analysis = {
  id: string
  overall_score: number | null
  technical_score: number | null
  content_score: number | null
  mobile_score: number | null
  ai_chatbot_score: number | null
  pages_crawled: number
  total_issues: number
  critical_issues: number
  warnings: number
  status: string
  created_at: string
  completed_at: string | null
}

type Project = {
  id: string
  name: string
  domain: string
}

type AnalysisOverviewProps = {
  analysis: Analysis
  project: Project
  history: Analysis[]
}

export function AnalysisOverview({
  analysis,
  project,
  history,
}: AnalysisOverviewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/analysis/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start analysis')
      }

      toast.success('Analysis started! This may take a few minutes.')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100'
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Add invisible real-time listener */}
      <AnalysisStatusListener
        analysisId={analysis.id}
        initialStatus={analysis.status as 'in_progress' | 'completed' | 'failed'}
      />

      {/* Header with action button */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium text-gray-900">
                Latest Analysis
              </h3>
              {analysis.status === 'in_progress' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  In Progress
                </span>
              )}
              {analysis.status === 'completed' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {analysis.completed_at
                ? `Completed ${formatDate(analysis.completed_at)}`
                : `Started ${formatDate(analysis.created_at)}`}
            </p>
          </div>
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing || analysis.status === 'in_progress'}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run New Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Score cards */}
      {analysis.status === 'completed' && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {/* Overall score */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">
              Overall Score
            </div>
            <div
              className={`text-4xl font-bold ${getScoreColor(analysis.overall_score)}`}
            >
              {analysis.overall_score ?? '-'}
            </div>
            <div className="mt-2 text-xs text-gray-500">Out of 100</div>
          </div>

          {/* Technical score */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">
              Technical
            </div>
            <div
              className={`text-3xl font-bold ${getScoreColor(analysis.technical_score)}`}
            >
              {analysis.technical_score ?? '-'}
            </div>
            <div className="mt-2">
              <div
                className={`h-2 rounded-full ${getScoreBgColor(analysis.technical_score)}`}
              >
                <div
                  className={`h-2 rounded-full ${analysis.technical_score !== null && analysis.technical_score >= 80 ? 'bg-green-600' : analysis.technical_score !== null && analysis.technical_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                  style={{
                    width: `${analysis.technical_score ?? 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Content score */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">Content</div>
            <div
              className={`text-3xl font-bold ${getScoreColor(analysis.content_score)}`}
            >
              {analysis.content_score ?? '-'}
            </div>
            <div className="mt-2">
              <div
                className={`h-2 rounded-full ${getScoreBgColor(analysis.content_score)}`}
              >
                <div
                  className={`h-2 rounded-full ${analysis.content_score !== null && analysis.content_score >= 80 ? 'bg-green-600' : analysis.content_score !== null && analysis.content_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                  style={{
                    width: `${analysis.content_score ?? 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mobile score */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">Mobile</div>
            <div
              className={`text-3xl font-bold ${getScoreColor(analysis.mobile_score)}`}
            >
              {analysis.mobile_score ?? '-'}
            </div>
            <div className="mt-2">
              <div
                className={`h-2 rounded-full ${getScoreBgColor(analysis.mobile_score)}`}
              >
                <div
                  className={`h-2 rounded-full ${analysis.mobile_score !== null && analysis.mobile_score >= 80 ? 'bg-green-600' : analysis.mobile_score !== null && analysis.mobile_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                  style={{
                    width: `${analysis.mobile_score ?? 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* AI Chatbot score */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">
              AI Chatbot
            </div>
            <div
              className={`text-3xl font-bold ${getScoreColor(analysis.ai_chatbot_score)}`}
            >
              {analysis.ai_chatbot_score ?? '-'}
            </div>
            <div className="mt-2">
              <div
                className={`h-2 rounded-full ${getScoreBgColor(analysis.ai_chatbot_score)}`}
              >
                <div
                  className={`h-2 rounded-full ${analysis.ai_chatbot_score !== null && analysis.ai_chatbot_score >= 80 ? 'bg-green-600' : analysis.ai_chatbot_score !== null && analysis.ai_chatbot_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                  style={{
                    width: `${analysis.ai_chatbot_score ?? 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div>
            <div className="text-sm font-medium text-gray-500">
              Pages Crawled
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {analysis.pages_crawled}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Total Issues</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {analysis.total_issues}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">
              Critical Issues
            </div>
            <div className="mt-1 text-2xl font-semibold text-red-600">
              {analysis.critical_issues}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Warnings</div>
            <div className="mt-1 text-2xl font-semibold text-yellow-600">
              {analysis.warnings}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
