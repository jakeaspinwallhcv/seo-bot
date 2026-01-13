'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type StartAnalysisButtonProps = {
  projectId: string
}

export function StartAnalysisButton({ projectId }: StartAnalysisButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/analysis/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start analysis')
      }

      toast.success('Analysis started! This may take a few minutes.')
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to start analysis'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <button
      onClick={handleStartAnalysis}
      disabled={isAnalyzing}
      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {isAnalyzing ? 'Starting...' : 'Start Analysis'}
    </button>
  )
}
