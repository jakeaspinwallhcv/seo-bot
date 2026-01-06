import { createClient } from '@/lib/supabase/server'

export type KeywordWithProject = {
  id: string
  keyword: string
  project_id: string
  created_at: string
  projects: {
    id: string
    name: string
    domain: string
  }
  rank_checks: Array<{
    rank: number | null
    checked_at: string
  }>
  latestRank: number | null
  previousRank: number | null
  rankChange: number | null
}

/**
 * Fetch all keywords for the current user with their latest rank data
 * Security: All queries filtered by user_id via RLS policies
 */
export async function getUserKeywords(
  userId: string
): Promise<KeywordWithProject[]> {
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

  // Fetch keywords with project info and rank checks
  const { data: keywords } = await supabase
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
      rank_checks (
        rank,
        checked_at
      )
    `
    )
    .in('project_id', projectIds)
    .order('created_at', { ascending: false })

  if (!keywords) {
    return []
  }

  // Process keywords to add latest rank and rank change
  const processedKeywords: KeywordWithProject[] = keywords.map((kw: any) => {
    const rankChecks = kw.rank_checks || []

    // Sort by checked_at descending
    const sortedChecks = [...rankChecks].sort(
      (a, b) =>
        new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime()
    )

    const latestRank = sortedChecks[0]?.rank ?? null
    const previousRank = sortedChecks[1]?.rank ?? null

    let rankChange: number | null = null
    if (latestRank !== null && previousRank !== null) {
      // Lower rank is better, so positive change means improvement
      rankChange = previousRank - latestRank
    }

    return {
      id: kw.id,
      keyword: kw.keyword,
      project_id: kw.project_id,
      created_at: kw.created_at,
      projects: kw.projects,
      rank_checks: sortedChecks,
      latestRank,
      previousRank,
      rankChange,
    }
  })

  return processedKeywords
}

/**
 * Delete a keyword
 * Security: RLS policies ensure user can only delete their own keywords
 */
export async function deleteKeyword(keywordId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('keywords')
    .delete()
    .eq('id', keywordId)

  if (error) {
    throw new Error(`Failed to delete keyword: ${error.message}`)
  }
}

/**
 * Update a keyword
 * Security: RLS policies ensure user can only update their own keywords
 */
export async function updateKeyword(
  keywordId: string,
  keyword: string
): Promise<void> {
  const supabase = await createClient()

  // Sanitize input
  const cleanKeyword = keyword.trim().toLowerCase()

  if (!cleanKeyword) {
    throw new Error('Keyword cannot be empty')
  }

  if (cleanKeyword.length > 200) {
    throw new Error('Keyword must be less than 200 characters')
  }

  const { error } = await supabase
    .from('keywords')
    .update({ keyword: cleanKeyword })
    .eq('id', keywordId)

  if (error) {
    throw new Error(`Failed to update keyword: ${error.message}`)
  }
}
