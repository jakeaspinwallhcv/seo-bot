import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { contentId, status } = await request.json()

    if (!contentId || !status) {
      return NextResponse.json(
        { error: 'Missing contentId or status' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['draft', 'pending_approval', 'approved', 'published', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Verify the content belongs to the user's project
    const { data: contentData } = await supabase
      .from('generated_content')
      .select('project_id, projects(user_id)')
      .eq('id', contentId)
      .single()

    if (!contentData || (contentData.projects as any)?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Content not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update status
    const { error: updateError } = await supabase
      .from('generated_content')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', contentId)

    if (updateError) {
      console.error('Failed to update content status:', updateError)
      throw new Error(`Failed to update status: ${updateError.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating content status:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update status',
      },
      { status: 500 }
    )
  }
}
