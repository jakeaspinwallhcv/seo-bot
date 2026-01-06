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

    // Get user's projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)

    const projectIds = projects?.map((p) => p.id) || []

    if (projectIds.length === 0) {
      return NextResponse.json(
        { error: 'No projects found' },
        { status: 404 }
      )
    }

    // Fetch all keywords for user's projects
    const { data: keywords } = await supabase
      .from('keywords')
      .select(
        `
        id,
        keyword,
        project_id,
        projects (
          domain
        )
      `
      )
      .in('project_id', projectIds)

    if (!keywords || keywords.length === 0) {
      return NextResponse.json(
        { error: 'No keywords found' },
        { status: 404 }
      )
    }

    // Check AI citations for each keyword sequentially
    let successful = 0
    const errors: Array<{ keywordId: string; keyword: string; error: string }> = []

    for (const kw of keywords) {
      try {
        const domain = (kw.projects as any)?.domain
        if (!domain) {
          errors.push({
            keywordId: kw.id,
            keyword: kw.keyword,
            error: 'Project domain not found',
          })
          continue
        }

        // Check AI search citations
        const results = await checkAISearch(kw.keyword, domain, platforms)

        // Store results in database
        const checkRecords = results.map((result) => ({
          keyword_id: kw.id,
          project_id: kw.project_id,
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
          errors.push({
            keywordId: kw.id,
            keyword: kw.keyword,
            error: `Failed to save results: ${insertError.message}`,
          })
        } else {
          successful++
        }
      } catch (error) {
        console.error(`Error checking AI citation for keyword ${kw.keyword}:`, error)
        errors.push({
          keywordId: kw.id,
          keyword: kw.keyword,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      total: keywords.length,
      successful,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error checking all AI citations:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to check AI citations',
      },
      { status: 500 }
    )
  }
}
