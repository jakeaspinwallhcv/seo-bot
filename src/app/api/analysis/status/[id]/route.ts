import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params

    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get analysis status
    const { data: analysis, error } = await supabase
      .from('website_analyses')
      .select('status, completed_at, pages_crawled, total_issues')
      .eq('id', id)
      .single()

    if (error || !analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    // Verify ownership through project
    const { data: analysisWithProject } = await supabase
      .from('website_analyses')
      .select('project_id, projects(user_id)')
      .eq('id', id)
      .single()

    if (
      !analysisWithProject ||
      (analysisWithProject.projects as any)?.user_id !== user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      status: analysis.status,
      completed_at: analysis.completed_at,
      pages_crawled: analysis.pages_crawled,
      total_issues: analysis.total_issues,
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
