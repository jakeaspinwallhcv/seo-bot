import { createClient } from '@/lib/supabase/server'

export type DashboardStats = {
  totalKeywords: number
  totalProjects: number
  aiCitationRate: number
  contentGenerated: number
  averageRank: number | null
}

export type ActivityItem = {
  id: string
  type: 'keyword_added' | 'project_created' | 'ai_check' | 'content_generated'
  title: string
  description: string
  timestamp: string
}

export type RankTrendData = {
  date: string // Format: "2025-01-13" (YYYY-MM-DD)
  rank: number // Average rank for that day
}

/**
 * Fetch dashboard statistics
 * Security: All queries filtered by user_id via RLS policies
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient()

  // Fetch user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', userId)

  const projectIds = projects?.map((p) => p.id) || []

  // If no projects, return zeros
  if (projectIds.length === 0) {
    return {
      totalKeywords: 0,
      totalProjects: 0,
      aiCitationRate: 0,
      contentGenerated: 0,
      averageRank: null,
    }
  }

  // Fetch keywords count
  const { count: keywordCount } = await supabase
    .from('keywords')
    .select('*', { count: 'exact', head: true })
    .in('project_id', projectIds)

  // Fetch AI citation rate (from last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: aiChecks } = await supabase
    .from('ai_search_checks')
    .select('is_cited')
    .in('project_id', projectIds)
    .gte('checked_at', thirtyDaysAgo.toISOString())

  const totalAiChecks = aiChecks?.length || 0
  const citedChecks = aiChecks?.filter((check) => check.is_cited).length || 0
  const aiCitationRate =
    totalAiChecks > 0 ? Math.round((citedChecks / totalAiChecks) * 100) : 0

  // Fetch content generated count (this month)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: contentCount } = await supabase
    .from('generated_content')
    .select('*', { count: 'exact', head: true })
    .in('project_id', projectIds)
    .gte('created_at', startOfMonth.toISOString())

  // Fetch average rank (from latest rank checks)
  // Get latest rank check for each keyword
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id')
    .in('project_id', projectIds)

  const keywordIds = keywords?.map((k) => k.id) || []

  let averageRank: number | null = null

  if (keywordIds.length > 0) {
    const { data: rankChecks } = await supabase
      .from('rank_checks')
      .select('keyword_id, rank, checked_at')
      .in('keyword_id', keywordIds)
      .not('rank', 'is', null)
      .order('checked_at', { ascending: false })

    if (rankChecks && rankChecks.length > 0) {
      // Get latest rank for each keyword
      const latestRanks = new Map<string, number>()
      rankChecks.forEach((check) => {
        if (!latestRanks.has(check.keyword_id) && check.rank !== null) {
          latestRanks.set(check.keyword_id, check.rank)
        }
      })

      if (latestRanks.size > 0) {
        const sum = Array.from(latestRanks.values()).reduce((a, b) => a + b, 0)
        averageRank = Math.round(sum / latestRanks.size)
      }
    }
  }

  return {
    totalKeywords: keywordCount || 0,
    totalProjects: projectIds.length,
    aiCitationRate,
    contentGenerated: contentCount || 0,
    averageRank,
  }
}

/**
 * Fetch recent activity
 * Security: All queries filtered by user_id via RLS policies
 */
export async function getRecentActivity(
  userId: string,
  limit: number = 10
): Promise<ActivityItem[]> {
  const supabase = await createClient()

  const activities: ActivityItem[] = []

  // Fetch user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  projects?.forEach((project) => {
    activities.push({
      id: `project-${project.id}`,
      type: 'project_created',
      title: 'Project created',
      description: `Created project: ${project.name}`,
      timestamp: project.created_at,
    })
  })

  // Fetch recent keywords
  const projectIds = projects?.map((p) => p.id) || []

  if (projectIds.length > 0) {
    const { data: keywords } = await supabase
      .from('keywords')
      .select('id, keyword, created_at, project_id')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })
      .limit(5)

    keywords?.forEach((keyword) => {
      activities.push({
        id: `keyword-${keyword.id}`,
        type: 'keyword_added',
        title: 'Keyword added',
        description: `Added keyword: "${keyword.keyword}"`,
        timestamp: keyword.created_at,
      })
    })

    // Fetch recent AI checks
    const { data: aiChecks } = await supabase
      .from('ai_search_checks')
      .select('id, platform, is_cited, checked_at, keyword_id, keywords(keyword)')
      .in('project_id', projectIds)
      .order('checked_at', { ascending: false })
      .limit(5)

    aiChecks?.forEach((check: any) => {
      activities.push({
        id: `ai-check-${check.id}`,
        type: 'ai_check',
        title: check.is_cited ? 'Cited in AI search' : 'AI check completed',
        description: check.keywords?.keyword
          ? `${check.platform} ${check.is_cited ? 'cited' : 'checked'}: "${check.keywords.keyword}"`
          : `${check.platform} check completed`,
        timestamp: check.checked_at,
      })
    })

    // Fetch recent content
    const { data: content } = await supabase
      .from('generated_content')
      .select('id, title, created_at')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })
      .limit(5)

    content?.forEach((item) => {
      activities.push({
        id: `content-${item.id}`,
        type: 'content_generated',
        title: 'Content generated',
        description: `Generated: ${item.title}`,
        timestamp: item.created_at,
      })
    })
  }

  // Sort all activities by timestamp and limit
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}

/**
 * Fetch rank trend data for last 30 days
 * Security: All queries filtered by user_id via RLS policies
 */
export async function getRankTrendData(userId: string): Promise<RankTrendData[]> {
  const supabase = await createClient()

  // Get user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', userId)

  const projectIds = projects?.map((p) => p.id) || []
  if (projectIds.length === 0) return []

  // Get keywords for these projects
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id')
    .in('project_id', projectIds)

  const keywordIds = keywords?.map((k) => k.id) || []
  if (keywordIds.length === 0) return []

  // Fetch rank checks from last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: rankChecks } = await supabase
    .from('rank_checks')
    .select('rank, checked_at')
    .in('keyword_id', keywordIds)
    .not('rank', 'is', null)
    .gte('checked_at', thirtyDaysAgo.toISOString())
    .order('checked_at', { ascending: true })

  if (!rankChecks || rankChecks.length === 0) return []

  // Group by date and calculate average rank per day
  const ranksByDate = new Map<string, number[]>()

  rankChecks.forEach((check) => {
    const date = check.checked_at.split('T')[0]
    if (!ranksByDate.has(date)) {
      ranksByDate.set(date, [])
    }
    ranksByDate.get(date)!.push(check.rank)
  })

  // Calculate averages
  const trendData: RankTrendData[] = []
  ranksByDate.forEach((ranks, date) => {
    const averageRank = Math.round(
      ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length
    )
    trendData.push({ date, rank: averageRank })
  })

  // Sort by date ascending
  return trendData.sort((a, b) => a.date.localeCompare(b.date))
}
