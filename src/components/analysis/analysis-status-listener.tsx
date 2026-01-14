'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type AnalysisStatusListenerProps = {
  analysisId: string
  initialStatus: 'in_progress' | 'completed' | 'failed'
}

/**
 * Client component that polls analysis status
 * and refreshes the page when analysis completes
 */
export function AnalysisStatusListener({
  analysisId,
  initialStatus,
}: AnalysisStatusListenerProps) {
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Don't poll if already completed/failed
    if (initialStatus === 'completed' || initialStatus === 'failed') {
      return
    }

    console.log(`Starting status polling for analysis ${analysisId}`)

    // Poll status every 3 seconds
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/analysis/status/${analysisId}`)

        if (!response.ok) {
          console.error('Status check failed:', response.status)
          return
        }

        const data = await response.json()

        if (data.status === 'completed' || data.status === 'failed') {
          console.log(`Analysis ${analysisId} ${data.status}, refreshing page`)

          // Stop polling
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }

          // Refresh page to show new data
          router.refresh()
        }
      } catch (error) {
        console.error('Error checking analysis status:', error)
      }
    }

    // Start polling immediately, then every 3 seconds
    checkStatus()
    intervalRef.current = setInterval(checkStatus, 3000)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        console.log(`Stopping status polling for analysis ${analysisId}`)
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [analysisId, initialStatus, router])

  // This component renders nothing (invisible)
  return null
}
