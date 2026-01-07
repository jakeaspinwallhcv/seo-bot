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

    const { contentId, title, content, metaDescription, suggestedKeywords } = await request.json()

    if (!contentId) {
      return NextResponse.json(
        { error: 'Missing contentId' },
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

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updates.title = title
    if (content !== undefined) {
      updates.content = content
      // Recalculate word count if content changed
      updates.word_count = content.split(/\s+/).length
    }
    if (metaDescription !== undefined) updates.meta_description = metaDescription
    if (suggestedKeywords !== undefined) updates.suggested_keywords = suggestedKeywords

    // Update content
    const { error: updateError } = await supabase
      .from('generated_content')
      .update(updates)
      .eq('id', contentId)

    if (updateError) {
      console.error('Failed to update content:', updateError)
      throw new Error(`Failed to update content: ${updateError.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update content',
      },
      { status: 500 }
    )
  }
}
