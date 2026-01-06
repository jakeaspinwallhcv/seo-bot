/**
 * AI-Powered Content Generation Service
 * Generates SEO-optimized blog posts and content using Claude
 */

import Anthropic from '@anthropic-ai/sdk'

export type ContentType = 'blog_post' | 'landing_page' | 'product_description'

export type GeneratedContent = {
  title: string
  content: string
  meta_description: string
  suggested_keywords: string[]
  estimated_reading_time: number
}

/**
 * Generate SEO-optimized content using Claude
 */
export async function generateContent(
  keyword: string,
  domain: string,
  contentType: ContentType = 'blog_post',
  targetWordCount: number = 1500
): Promise<GeneratedContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const anthropic = new Anthropic({ apiKey })

  // Create content generation prompt
  const prompt = buildContentPrompt(keyword, domain, contentType, targetWordCount)

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 8192,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse the structured response
    const parsed = parseContentResponse(responseText)

    return parsed
  } catch (error) {
    console.error('Content generation error:', error)
    throw error
  }
}

/**
 * Build the content generation prompt
 */
function buildContentPrompt(
  keyword: string,
  domain: string,
  contentType: ContentType,
  targetWordCount: number
): string {
  const typeInstructions = {
    blog_post: `Write an informative, engaging blog post that provides value to readers while naturally incorporating SEO best practices.`,
    landing_page: `Write compelling landing page copy that converts visitors into customers while being optimized for search engines.`,
    product_description: `Write a detailed product description that highlights benefits, features, and answers common questions.`,
  }

  return `You are an expert SEO content writer. Generate high-quality content for the website "${domain}" targeting the keyword "${keyword}".

${typeInstructions[contentType]}

Requirements:
- Target word count: ${targetWordCount} words
- Primary keyword: "${keyword}"
- Write for the domain: ${domain}
- Use natural, conversational tone
- Include relevant subheadings (H2, H3)
- Optimize for both traditional search engines AND AI chatbots (Claude, ChatGPT, Perplexity, Gemini)
- Include specific, actionable information
- Write in a way that AI chatbots would want to cite this content

AI Chatbot Optimization Tips:
- Use clear, structured formatting
- Provide direct answers to common questions
- Include data, statistics, or specific examples
- Use authoritative language
- Structure content with FAQ-style sections where appropriate

Return your response in this EXACT format:

TITLE:
[Compelling, SEO-optimized title with keyword]

META_DESCRIPTION:
[Concise 150-160 character meta description]

KEYWORDS:
[Comma-separated list of 5-8 related keywords]

CONTENT:
[The full content in markdown format with proper headings]

Remember to:
1. Make it genuinely valuable and informative
2. Write naturally - don't keyword stuff
3. Use headings and structure clearly
4. Include specific information that establishes authority
5. Format for readability (short paragraphs, bullet points)
6. Optimize for AI chatbot citation (clear answers, structured data)`
}

/**
 * Parse Claude's structured response
 */
function parseContentResponse(response: string): GeneratedContent {
  const sections = {
    title: '',
    meta_description: '',
    keywords: '',
    content: '',
  }

  // Extract sections (using [\s\S] instead of . with s flag)
  const titleMatch = response.match(/TITLE:\s*\n(.+?)(?=\n\n|META_DESCRIPTION:|$)/)
  const metaMatch = response.match(
    /META_DESCRIPTION:\s*\n(.+?)(?=\n\n|KEYWORDS:|$)/
  )
  const keywordsMatch = response.match(/KEYWORDS:\s*\n(.+?)(?=\n\n|CONTENT:|$)/)
  const contentMatch = response.match(/CONTENT:\s*\n([\s\S]+)$/)

  sections.title = titleMatch?.[1]?.trim() || 'Untitled'
  sections.meta_description = metaMatch?.[1]?.trim() || ''
  sections.keywords = keywordsMatch?.[1]?.trim() || ''
  sections.content = contentMatch?.[1]?.trim() || ''

  // Parse keywords
  const keywordsList = sections.keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)

  // Estimate reading time (average 200 words per minute)
  const wordCount = sections.content.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)

  return {
    title: sections.title,
    content: sections.content,
    meta_description: sections.meta_description,
    suggested_keywords: keywordsList,
    estimated_reading_time: readingTime,
  }
}

/**
 * Generate content outline (faster, for previewing)
 */
export async function generateContentOutline(
  keyword: string,
  domain: string
): Promise<{
  title: string
  outline: string[]
  estimatedWordCount: number
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const anthropic = new Anthropic({ apiKey })

  const prompt = `You are an expert SEO content strategist. Create a content outline for a blog post targeting the keyword "${keyword}" for the website "${domain}".

Return ONLY a JSON object with this structure:
{
  "title": "SEO-optimized title",
  "outline": ["H2: Introduction", "H2: Main point 1", "H3: Subpoint", ...],
  "estimatedWordCount": 1500
}

Make it valuable, well-structured, and optimized for both search engines and AI chatbots.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 2048,
      temperature: 0.5,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : '{}'

    // Parse JSON response
    const parsed = JSON.parse(responseText)

    return {
      title: parsed.title || 'Untitled',
      outline: parsed.outline || [],
      estimatedWordCount: parsed.estimatedWordCount || 1500,
    }
  } catch (error) {
    console.error('Outline generation error:', error)
    throw error
  }
}
