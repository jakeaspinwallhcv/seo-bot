'use client'

import {
  AlertTriangle,
  AlertCircle,
  Info,
} from 'lucide-react'

type Issue = {
  id: string
  severity: 'critical' | 'warning' | 'info'
  category: 'technical' | 'content' | 'mobile' | 'ai_chatbot'
  issue_type: string
  description: string
  recommendation: string | null
  page_url: string | null
}

type IssuesListProps = {
  issues: Issue[]
}

export function IssuesList({ issues }: IssuesListProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return null
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Critical
          </span>
        )
      case 'warning':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Warning
          </span>
        )
      case 'info':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Info
          </span>
        )
      default:
        return null
    }
  }

  const getCategoryBadge = (category: string) => {
    const labels: Record<string, string> = {
      technical: 'Technical',
      content: 'Content',
      mobile: 'Mobile',
      ai_chatbot: 'AI Chatbot',
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {labels[category] || category}
      </span>
    )
  }

  // Group issues by severity
  const criticalIssues = issues.filter((i) => i.severity === 'critical')
  const warningIssues = issues.filter((i) => i.severity === 'warning')
  const infoIssues = issues.filter((i) => i.severity === 'info')

  return (
    <div className="space-y-6">
      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-900 mb-3">
            Critical Issues ({criticalIssues.length})
          </h4>
          <div className="space-y-3">
            {criticalIssues.map((issue) => (
              <div
                key={issue.id}
                className="border-l-4 border-red-600 bg-red-50 p-4 rounded-r-md"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getSeverityIcon(issue.severity)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryBadge(issue.category)}
                      <span className="text-sm font-medium text-red-900">
                        {issue.issue_type}
                      </span>
                    </div>
                    <p className="text-sm text-red-800">{issue.description}</p>
                    {issue.recommendation && (
                      <div className="mt-2 text-sm text-red-700">
                        <span className="font-medium">Recommendation:</span>{' '}
                        {issue.recommendation}
                      </div>
                    )}
                    {issue.page_url && (
                      <div className="mt-2 text-xs text-red-600">
                        Page: {issue.page_url}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warningIssues.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-yellow-900 mb-3">
            Warnings ({warningIssues.length})
          </h4>
          <div className="space-y-3">
            {warningIssues.map((issue) => (
              <div
                key={issue.id}
                className="border-l-4 border-yellow-600 bg-yellow-50 p-4 rounded-r-md"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getSeverityIcon(issue.severity)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryBadge(issue.category)}
                      <span className="text-sm font-medium text-yellow-900">
                        {issue.issue_type}
                      </span>
                    </div>
                    <p className="text-sm text-yellow-800">{issue.description}</p>
                    {issue.recommendation && (
                      <div className="mt-2 text-sm text-yellow-700">
                        <span className="font-medium">Recommendation:</span>{' '}
                        {issue.recommendation}
                      </div>
                    )}
                    {issue.page_url && (
                      <div className="mt-2 text-xs text-yellow-600">
                        Page: {issue.page_url}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Issues */}
      {infoIssues.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-blue-900 mb-3">
            Informational ({infoIssues.length})
          </h4>
          <div className="space-y-3">
            {infoIssues.map((issue) => (
              <div
                key={issue.id}
                className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-r-md"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getSeverityIcon(issue.severity)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryBadge(issue.category)}
                      <span className="text-sm font-medium text-blue-900">
                        {issue.issue_type}
                      </span>
                    </div>
                    <p className="text-sm text-blue-800">{issue.description}</p>
                    {issue.recommendation && (
                      <div className="mt-2 text-sm text-blue-700">
                        <span className="font-medium">Recommendation:</span>{' '}
                        {issue.recommendation}
                      </div>
                    )}
                    {issue.page_url && (
                      <div className="mt-2 text-xs text-blue-600">
                        Page: {issue.page_url}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
