import { createClient } from '@/lib/supabase/server'

export type GeneratedContentItem = {
  id: string
  project_id: string
  keyword_id: string | null
  content_type: string
  title: string
  content: string
  meta_description: string | null
  suggested_keywords: string[] | null
  estimated_reading_time: number | null
  word_count: number | null
  status: string
  created_at: string
  updated_at: string
  keywords: {
    keyword: string
  } | null
  projects: {
    id: string
    name: string
    domain: string
  }
}

/**
 * Fetch all generated content for the current user
 */
export async function getUserContent(
  userId: string
): Promise<GeneratedContentItem[]> {
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

  // Fetch generated content
  const { data: content, error } = await supabase
    .from('generated_content')
    .select(
      `
      id,
      project_id,
      keyword_id,
      content_type,
      title,
      content,
      meta_description,
      suggested_keywords,
      estimated_reading_time,
      word_count,
      status,
      created_at,
      updated_at,
      keywords (
        keyword
      ),
      projects (
        id,
        name,
        domain
      )
    `
    )
    .in('project_id', projectIds)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching content:', error)
    return []
  }

  // Transform the response to match our type
  const transformed = (content || []).map((item: any) => ({
    ...item,
    keywords: Array.isArray(item.keywords) ? item.keywords[0] : item.keywords,
    projects: Array.isArray(item.projects) ? item.projects[0] : item.projects,
  }))

  return transformed as GeneratedContentItem[]
}
