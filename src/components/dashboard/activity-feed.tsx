import { formatDistanceToNow } from 'date-fns'
import type { ActivityItem } from '@/lib/api/dashboard'
import {
  FileTextIcon,
  HashIcon,
  FolderIcon,
  BrainCircuitIcon,
} from 'lucide-react'

type ActivityFeedProps = {
  activities: ActivityItem[]
  loading?: boolean
}

function getActivityIcon(type: ActivityItem['type']) {
  switch (type) {
    case 'project_created':
      return <FolderIcon className="h-5 w-5 text-blue-500" />
    case 'keyword_added':
      return <HashIcon className="h-5 w-5 text-green-500" />
    case 'ai_check':
      return <BrainCircuitIcon className="h-5 w-5 text-purple-500" />
    case 'content_generated':
      return <FileTextIcon className="h-5 w-5 text-orange-500" />
  }
}

function getActivityColor(type: ActivityItem['type']) {
  switch (type) {
    case 'project_created':
      return 'bg-blue-50 border-blue-200'
    case 'keyword_added':
      return 'bg-green-50 border-green-200'
    case 'ai_check':
      return 'bg-purple-50 border-purple-200'
    case 'content_generated':
      return 'bg-orange-50 border-orange-200'
  }
}

export function ActivityFeed({ activities, loading = false }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse"
          >
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding keywords or running an AI check
        </p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {activity.title}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>{activity.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
