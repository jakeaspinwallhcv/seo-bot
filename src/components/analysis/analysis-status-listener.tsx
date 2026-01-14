'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type AnalysisStatusListenerProps = {
  analysisId: string
  initialStatus: 'in_progress' | 'completed' | 'failed'
}

/**
 * Client component that subscribes to analysis status changes
 * and refreshes the page when analysis completes
 */
export function AnalysisStatusListener({
  analysisId,
  initialStatus,
}: AnalysisStatusListenerProps) {
  const router = useRouter()

  useEffect(() => {
    // Don't subscribe if already completed/failed
    if (initialStatus === 'completed' || initialStatus === 'failed') {
      return
    }

    const supabase = createClient()

    console.log(`Subscribing to analysis ${analysisId} status updates`)

    // Subscribe to changes on this specific analysis
    const channel = supabase
      .channel(`analysis-${analysisId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'website_analyses',
          filter: `id=eq.${analysisId}`,
        },
        (payload) => {
          console.log('Analysis status changed:', payload)

          const newStatus = payload.new.status

          if (newStatus === 'completed' || newStatus === 'failed') {
            console.log(`Analysis ${analysisId} ${newStatus}, refreshing page`)
            router.refresh()
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      console.log(`Unsubscribing from analysis ${analysisId}`)
      supabase.removeChannel(channel)
    }
  }, [analysisId, initialStatus, router])

  // This component renders nothing (invisible)
  return null
}
