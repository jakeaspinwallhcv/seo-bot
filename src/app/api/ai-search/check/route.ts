import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAISearch, type AIPlatform } from '@/lib/services/ai-search'

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
      .select('keyword, project_id, projects(user_id, domain)')
      .eq('id', keywordId)
      .single()

    if (!keywordData || (keywordData.projects as any)?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Keyword not found or unauthorized' },
        { status: 404 }
      )
    }

    const keyword = keywordData.keyword
    const domain = (keywordData.projects as any)?.domain
    const projectId = keywordData.project_id

    if (!domain) {
      return NextResponse.json(
        { error: 'Project domain not found' },
        { status: 400 }
      )
    }

    // Check if AI APIs are configured
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
    const hasOpenAI = !!process.env.OPENAI_API_KEY

    if (!hasAnthropic && !hasOpenAI) {
      return NextResponse.json(
        {
          error:
            'No AI APIs configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY environment variables.',
        },
        { status: 500 }
      )
    }

    // Determine which platforms to check
    const platforms: AIPlatform[] = []
    if (hasAnthropic) platforms.push('claude')
    if (hasOpenAI) platforms.push('chatgpt')

    // Check AI search citations
    const results = await checkAISearch(keyword, domain, platforms)

    // Store results in database
    const checkRecords = results.map((result) => ({
      keyword_id: keywordId,
      project_id: projectId,
      platform: result.platform,
      query: result.query,
      is_cited: result.is_cited,
      response_text: result.response_text,
      citation_context: result.citation_context,
      checked_at: result.checked_at,
    }))

    const { error: insertError } = await supabase
      .from('ai_search_checks')
      .insert(checkRecords)

    if (insertError) {
      console.error('Failed to save AI search checks:', insertError)
      throw new Error(`Failed to save results: ${insertError.message}`)
    }

    // Calculate citation rate
    const citedCount = results.filter((r) => r.is_cited).length
    const totalCount = results.length

    return NextResponse.json({
      success: true,
      keyword,
      results,
      summary: {
        total: totalCount,
        cited: citedCount,
        citationRate: totalCount > 0 ? Math.round((citedCount / totalCount) * 100) : 0,
      },
    })
  } catch (error) {
    console.error('Error checking AI search:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to check AI search',
      },
      { status: 500 }
    )
  }
}
