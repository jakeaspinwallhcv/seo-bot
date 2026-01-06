import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
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
      .select('keyword, project_id, projects(user_id, domain)')
      .eq('id', keywordId)
      .single()

    if (!keywordData || (keywordData.projects as any)?.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Keyword not found or unauthorized' },
        { status: 404 }
      )
    }

    // TODO: Replace with actual DataForSEO integration in Days 14-17
    // For now, simulate a rank check with random data
    const simulatedRank = Math.floor(Math.random() * 100) + 1

    // Insert rank check result
    const { error: insertError } = await supabase
      .from('rank_checks')
      .insert({
        keyword_id: keywordId,
        rank: simulatedRank,
        checked_at: new Date().toISOString(),
      })

    if (insertError) {
      throw new Error(`Failed to save rank check: ${insertError.message}`)
    }

    return NextResponse.json({
      success: true,
      rank: simulatedRank,
      message: 'Rank check complete (simulated data - real integration coming in Days 14-17)',
    })
  } catch (error) {
    console.error('Error checking rank:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check rank' },
      { status: 500 }
    )
  }
}
