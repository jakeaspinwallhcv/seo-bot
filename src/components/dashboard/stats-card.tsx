import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

type StatsCardProps = {
  title: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  icon?: React.ReactNode
  loading?: boolean
}

export function StatsCard({
  title,
  value,
  trend,
  subtitle,
  icon,
  loading = false,
}: StatsCardProps) {
  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
        <div className="p-5">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16 mt-2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="mt-1 flex items-baseline">
              <span className="text-3xl font-semibold text-gray-900">
                {value}
              </span>
              {trend && (
                <span
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend.isPositive ? (
                    <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                  )}
                  <span className="sr-only">
                    {trend.isPositive ? 'Increased' : 'Decreased'} by
                  </span>
                  {Math.abs(trend.value)}%
                </span>
              )}
            </dd>
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 ml-4">
              <div className="rounded-md bg-blue-50 p-3">{icon}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
