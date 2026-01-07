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

    const { contentId } = await request.json()

    if (!contentId) {
      return NextResponse.json(
        { error: 'Missing contentId' },
        { status: 400 }
      )
    }

    // Verify the content belongs to the user's project
    const { data: contentData } = await supabase
      .from('generated_content')
      .select('project_id, title, projects(user_id)')
      .eq('id', contentId)
      .single()

    if (!contentData || (contentData.projects as any)?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Content not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete content
    const { error: deleteError } = await supabase
      .from('generated_content')
      .delete()
      .eq('id', contentId)

    if (deleteError) {
      console.error('Failed to delete content:', deleteError)
      throw new Error(`Failed to delete content: ${deleteError.message}`)
    }

    return NextResponse.json({
      success: true,
      title: contentData.title
    })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete content',
      },
      { status: 500 }
    )
  }
}
