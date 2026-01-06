import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateKeyword } from '@/lib/api/keywords'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication - use getUser() for security
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keywordId, keyword } = await request.json()

    if (!keywordId || !keyword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the keyword belongs to the user's project
    const { data: keywordData } = await supabase
      .from('keywords')
      .select('project_id, projects(user_id)')
      .eq('id', keywordId)
      .single()

    if (!keywordData || (keywordData.projects as any)?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Keyword not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update the keyword
    await updateKeyword(keywordId, keyword)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating keyword:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update keyword' },
      { status: 500 }
    )
  }
}
