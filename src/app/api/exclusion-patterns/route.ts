import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for creating exclusion pattern
const createPatternSchema = z.object({
  projectId: z.string().uuid(),
  pattern: z.string().min(1).max(100), // Max 100 chars to prevent ReDoS
})

/**
 * GET /api/exclusion-patterns?projectId=xxx
 * Returns all exclusion patterns for a project
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get projectId from query params
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId parameter' },
        { status: 400 }
      )
    }

    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      )
    }

    // Get all exclusion patterns for the project
    const { data: patterns, error: patternsError } = await supabase
      .from('crawler_exclusion_patterns')
      .select('*')
      .eq('project_id', projectId)
      .order('is_default', { ascending: false }) // Defaults first
      .order('created_at', { ascending: true })

    if (patternsError) {
      console.error('Failed to fetch patterns:', patternsError)
      return NextResponse.json(
        { error: 'Failed to fetch exclusion patterns' },
        { status: 500 }
      )
    }

    return NextResponse.json({ patterns: patterns || [] })
  } catch (error) {
    console.error('Error fetching exclusion patterns:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch exclusion patterns',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/exclusion-patterns
 * Creates a new custom exclusion pattern
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = createPatternSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { projectId, pattern } = validation.data

    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      )
    }

    // Validate pattern syntax and check for ReDoS vulnerabilities
    try {
      // Track regex compilation time to detect complex patterns
      const startTime = Date.now()

      const regexPattern = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')
      new RegExp(`^${regexPattern}$`, 'i')

      // Check if compilation took too long (indicates complexity)
      if (Date.now() - startTime > 100) {
        return NextResponse.json(
          { error: 'Pattern too complex (compilation timeout)' },
          { status: 400 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid pattern syntax' },
        { status: 400 }
      )
    }

    // Create the exclusion pattern
    const { data: newPattern, error: insertError } = await supabase
      .from('crawler_exclusion_patterns')
      .insert({
        project_id: projectId,
        pattern: pattern,
        is_default: false,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      // Handle duplicate pattern
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'This pattern already exists' },
          { status: 409 }
        )
      }

      console.error('Failed to create pattern:', insertError)
      return NextResponse.json(
        { error: 'Failed to create exclusion pattern' },
        { status: 500 }
      )
    }

    return NextResponse.json({ pattern: newPattern }, { status: 201 })
  } catch (error) {
    console.error('Error creating exclusion pattern:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create exclusion pattern',
      },
      { status: 500 }
    )
  }
}
