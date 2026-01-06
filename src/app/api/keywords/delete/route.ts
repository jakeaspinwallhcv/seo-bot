import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteKeyword } from '@/lib/api/keywords'

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

    const { keywordId } = await request.json()

    if (!keywordId) {
      return NextResponse.json(
        { error: 'Missing keyword ID' },
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

    // Delete the keyword
    await deleteKeyword(keywordId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting keyword:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete keyword' },
      { status: 500 }
    )
  }
}
