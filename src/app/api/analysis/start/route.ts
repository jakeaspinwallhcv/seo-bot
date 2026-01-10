import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeWebsite } from '@/lib/services/website-analyzer'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing project ID' },
        { status: 400 }
      )
    }

    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check if there's already an analysis in progress
    const { data: inProgressAnalysis } = await supabase
      .from('website_analyses')
      .select('id')
      .eq('project_id', projectId)
      .eq('status', 'in_progress')
      .single()

    if (inProgressAnalysis) {
      return NextResponse.json(
        { error: 'An analysis is already in progress for this project' },
        { status: 409 }
      )
    }

    // Create a new analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('website_analyses')
      .insert({
        project_id: projectId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (analysisError || !analysis) {
      console.error('Failed to create analysis record:', analysisError)
      return NextResponse.json(
        { error: 'Failed to create analysis' },
        { status: 500 }
      )
    }

    // Start analysis in the background (don't await)
    analyzeWebsite(project.domain, analysis.id, supabase).catch((error) => {
      console.error('Background analysis failed:', error)
      // Update analysis status to failed
      supabase
        .from('website_analyses')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', analysis.id)
        .then()
    })

    return NextResponse.json({
      success: true,
      analysis_id: analysis.id,
    })
  } catch (error) {
    console.error('Error starting analysis:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to start analysis',
      },
      { status: 500 }
    )
  }
}
