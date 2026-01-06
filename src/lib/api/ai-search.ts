import { createClient } from '@/lib/supabase/server'

export type AICheck = {
  id: string
  platform: string
  query: string
  is_cited: boolean
  response_text: string
  citation_context?: string | null
  checked_at: string
}

export type KeywordWithAIChecks = {
  id: string
  keyword: string
  project_id: string
  created_at: string
  projects: {
    id: string
    name: string
    domain: string
  }
  ai_search_checks: AICheck[]
  latestChecks: AICheck[]
  citationRate: number
  lastChecked: string | null
}

/**
 * Fetch all keywords for the current user with their AI search check history
 * Security: All queries filtered by user_id via RLS policies
 */
export async function getUserKeywordsWithAIChecks(
  userId: string
): Promise<KeywordWithAIChecks[]> {
  const supabase = await createClient()

  // Fetch user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', userId)

  const projectIds = projects?.map((p) => p.id) || []

  if (projectIds.length === 0) {
    return []
  }

  // Fetch keywords with project info and AI search checks
  const { data: keywords, error: keywordsError } = await supabase
    .from('keywords')
    .select(
      `
      id,
      keyword,
      project_id,
      created_at,
      projects (
        id,
        name,
        domain
      ),
      ai_search_checks (
        id,
        platform,
        query,
        is_cited,
        response_text,
        citation_context,
        checked_at
      )
    `
    )
    .in('project_id', projectIds)
    .order('created_at', { ascending: false })

  if (keywordsError) {
    console.error('Error fetching keywords for AI search:', keywordsError)
    return []
  }

  if (!keywords) {
    return []
  }

  // Process keywords to add citation metrics
  const processedKeywords: KeywordWithAIChecks[] = keywords.map((kw: any) => {
    const checks = kw.ai_search_checks || []

    // Sort checks by date (most recent first)
    const sortedChecks = [...checks].sort(
      (a: AICheck, b: AICheck) =>
        new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime()
    )

    // Get latest check results per platform
    const latestByPlatform = new Map<string, AICheck>()
    sortedChecks.forEach((check: AICheck) => {
      if (!latestByPlatform.has(check.platform)) {
        latestByPlatform.set(check.platform, check)
      }
    })

    // Calculate citation rate from latest checks
    const latestChecks = Array.from(latestByPlatform.values())
    const citedCount = latestChecks.filter((c) => c.is_cited).length
    const citationRate =
      latestChecks.length > 0
        ? Math.round((citedCount / latestChecks.length) * 100)
        : 0

    return {
      id: kw.id,
      keyword: kw.keyword,
      project_id: kw.project_id,
      created_at: kw.created_at,
      projects: kw.projects,
      ai_search_checks: sortedChecks,
      latestChecks,
      citationRate,
      lastChecked: sortedChecks[0]?.checked_at || null,
    }
  })

  return processedKeywords
}
