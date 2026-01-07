import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateContent,
  type ContentType,
} from '@/lib/services/content-generation'

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

    const { keywordId, contentType, targetWordCount, includeHeroImage } = await request.json()

    if (!keywordId) {
      return NextResponse.json(
        { error: 'Missing keyword ID' },
        { status: 400 }
      )
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error:
            'Content generation not configured. Set ANTHROPIC_API_KEY environment variable.',
        },
        { status: 500 }
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

    // Generate content using AI
    const result = await generateContent(
      keyword,
      domain,
      (contentType as ContentType) || 'blog_post',
      targetWordCount || 1500,
      includeHeroImage !== false // Default to true if not specified
    )

    // Calculate word count
    const wordCount = result.content.split(/\s+/).length

    // Store generated content in database
    const { data: contentRecord, error: insertError } = await supabase
      .from('generated_content')
      .insert({
        project_id: projectId,
        keyword_id: keywordId,
        content_type: contentType || 'blog_post',
        title: result.title,
        content: result.content,
        meta_description: result.meta_description,
        suggested_keywords: result.suggested_keywords,
        estimated_reading_time: result.estimated_reading_time,
        hero_image_url: result.hero_image_url,
        word_count: wordCount,
        status: 'draft',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to save generated content:', insertError)
      throw new Error(`Failed to save content: ${insertError.message}`)
    }

    return NextResponse.json({
      success: true,
      content: contentRecord,
    })
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate content',
      },
      { status: 500 }
    )
  }
}
