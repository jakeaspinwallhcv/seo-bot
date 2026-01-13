import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for updating pattern
const updatePatternSchema = z.object({
  isActive: z.boolean(),
})

/**
 * PATCH /api/exclusion-patterns/:id
 * Toggles pattern on/off
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const patternId = params.id

    // Parse and validate request body
    const body = await request.json()
    const validation = updatePatternSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { isActive } = validation.data

    // Get the pattern and verify ownership
    const { data: pattern, error: patternError } = await supabase
      .from('crawler_exclusion_patterns')
      .select('id, project_id')
      .eq('id', patternId)
      .single()

    if (patternError || !pattern) {
      return NextResponse.json(
        { error: 'Pattern not found' },
        { status: 404 }
      )
    }

    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', pattern.project_id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update the pattern
    const { data: updatedPattern, error: updateError } = await supabase
      .from('crawler_exclusion_patterns')
      .update({ is_active: isActive })
      .eq('id', patternId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update pattern:', updateError)
      return NextResponse.json(
        { error: 'Failed to update pattern' },
        { status: 500 }
      )
    }

    return NextResponse.json({ pattern: updatedPattern })
  } catch (error) {
    console.error('Error updating pattern:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to update pattern',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/exclusion-patterns/:id
 * Deletes a custom exclusion pattern (cannot delete default patterns)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const patternId = params.id

    // Get the pattern and verify it's not default
    const { data: pattern, error: patternError } = await supabase
      .from('crawler_exclusion_patterns')
      .select('id, project_id, is_default')
      .eq('id', patternId)
      .single()

    if (patternError || !pattern) {
      return NextResponse.json(
        { error: 'Pattern not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of default patterns
    if (pattern.is_default) {
      return NextResponse.json(
        { error: 'Cannot delete default patterns. Disable them instead.' },
        { status: 403 }
      )
    }

    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', pattern.project_id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete the pattern
    const { error: deleteError } = await supabase
      .from('crawler_exclusion_patterns')
      .delete()
      .eq('id', patternId)

    if (deleteError) {
      console.error('Failed to delete pattern:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete pattern' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pattern:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to delete pattern',
      },
      { status: 500 }
    )
  }
}
