import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TIER_LIMITS, hasReachedLimit } from '@/lib/utils/tier-limits'

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

    const { projectId, keyword } = await request.json()

    if (!projectId || !keyword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Sanitize keyword
    const cleanKeyword = keyword.trim().toLowerCase()

    if (!cleanKeyword) {
      return NextResponse.json(
        { error: 'Keyword cannot be empty' },
        { status: 400 }
      )
    }

    if (cleanKeyword.length > 200) {
      return NextResponse.json(
        { error: 'Keyword must be less than 200 characters' },
        { status: 400 }
      )
    }

    // Verify the project belongs to the user
    const { data: projectData } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single()

    if (!projectData || projectData.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      )
    }

    // Get user profile for tier limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tier = (profile?.subscription_tier || 'free') as keyof typeof TIER_LIMITS

    // Check if user has reached keyword limit
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)

    const projectIds = projects?.map((p) => p.id) || []

    if (projectIds.length > 0) {
      const { count } = await supabase
        .from('keywords')
        .select('*', { count: 'exact', head: true })
        .in('project_id', projectIds)

      if (hasReachedLimit(tier, 'keywords', count || 0)) {
        return NextResponse.json(
          {
            error: `You've reached your ${tier} tier limit of ${TIER_LIMITS[tier].keywords} keywords. Upgrade to add more.`,
          },
          { status: 403 }
        )
      }
    }

    // Check for duplicate keyword in this project
    const { data: existingKeyword } = await supabase
      .from('keywords')
      .select('id')
      .eq('project_id', projectId)
      .eq('keyword', cleanKeyword)
      .maybeSingle()

    if (existingKeyword) {
      return NextResponse.json(
        { error: 'This keyword already exists in your project' },
        { status: 400 }
      )
    }

    // Insert the keyword
    const { data: newKeyword, error: insertError } = await supabase
      .from('keywords')
      .insert({
        project_id: projectId,
        keyword: cleanKeyword,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to add keyword: ${insertError.message}`)
    }

    return NextResponse.json({ success: true, keyword: newKeyword })
  } catch (error) {
    console.error('Error adding keyword:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add keyword' },
      { status: 500 }
    )
  }
}
