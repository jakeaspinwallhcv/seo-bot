/**
 * AI-Powered Content Generation Service
 * Generates SEO-optimized blog posts and content using Claude
 * Generates hero images using DALL-E 3
 */

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export type ContentType = 'blog_post' | 'landing_page' | 'product_description'

export type GeneratedContent = {
  title: string
  content: string
  meta_description: string
  suggested_keywords: string[]
  estimated_reading_time: number
  hero_image_url?: string
}

/**
 * Generate SEO-optimized content using Claude
 */
export async function generateContent(
  keyword: string,
  domain: string,
  contentType: ContentType = 'blog_post',
  targetWordCount: number = 1500,
  includeHeroImage: boolean = true
): Promise<GeneratedContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const anthropic = new Anthropic({ apiKey })

  // Create content generation prompt
  const prompt = buildContentPrompt(keyword, domain, contentType, targetWordCount)

  try {
    // Generate content with Claude using prompt caching
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 8192,
      temperature: 0.7,
      system: [
        {
          type: 'text',
          text: 'You are an expert SEO content writer specializing in creating high-quality, engaging content optimized for both traditional search engines and AI chatbots.',
          cache_control: { type: 'ephemeral' },
        },
      ],
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

    // Generate hero image with DALL-E 3 (only if requested)
    if (includeHeroImage && process.env.OPENAI_API_KEY) {
      try {
        const heroImageUrl = await generateHeroImage(keyword, domain)
        parsed.hero_image_url = heroImageUrl
      } catch (error) {
        console.error('Hero image generation failed:', error)
        // Continue without image - don't fail the entire content generation
      }
    }

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

CRITICAL SEO REQUIREMENT - Internal & External Links:
- When mentioning local businesses, landmarks, neighborhoods, or locations, include actual markdown links [Business Name](https://www.example.com)
- Include 5-10 relevant external links to authoritative sources (Wikipedia, official sites, .gov/.edu sites, industry authorities)
- Link to real websites whenever you mention:
  * Local businesses (restaurants, shops, attractions)
  * Landmarks or tourist destinations
  * Neighborhoods or areas
  * Schools or institutions
  * Statistics or data (link to source)
  * Industry terms (link to definitions)
- Use descriptive anchor text, not "click here"
- All links should be real, working URLs
- Format links in markdown: [Anchor Text](https://url.com)

AI Chatbot Optimization Tips:
- Use clear, structured formatting
- Provide direct answers to common questions
- Include data, statistics, or specific examples (with source links)
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
[The full content in markdown format with proper headings and LINKS]

Remember to:
1. Make it genuinely valuable and informative
2. Write naturally - don't keyword stuff
3. Use headings and structure clearly
4. Include specific information that establishes authority
5. Format for readability (short paragraphs, bullet points, proper spacing between sections)
6. Optimize for AI chatbot citation (clear answers, structured data)
7. INCLUDE MULTIPLE LINKS to businesses, landmarks, and authoritative sources
8. Use markdown formatting with blank lines between paragraphs for proper spacing`
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

  // Extract sections with more flexible regex (handles multiple spaces/newlines)
  const titleMatch = response.match(/TITLE:\s*\n\s*(.+?)(?=\n+META_DESCRIPTION:|$)/s)
  const metaMatch = response.match(
    /META_DESCRIPTION:\s*\n\s*(.+?)(?=\n+KEYWORDS:|$)/s
  )
  const keywordsMatch = response.match(/KEYWORDS:\s*\n\s*(.+?)(?=\n+CONTENT:|$)/s)
  const contentMatch = response.match(/CONTENT:\s*\n([\s\S]+)$/s)

  sections.title = titleMatch?.[1]?.trim() || 'Untitled'
  sections.meta_description = metaMatch?.[1]?.trim() || ''
  sections.keywords = keywordsMatch?.[1]?.trim() || ''
  sections.content = contentMatch?.[1]?.trim() || ''

  // Log for debugging if meta description is missing
  if (!sections.meta_description) {
    console.log('Warning: No meta description found in response')
    console.log('Response preview:', response.substring(0, 500))
  }

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
      model: 'claude-opus-4-5-20251101',
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

/**
 * Use Claude to create a detailed, accurate image prompt based on keyword research
 */
async function generateImagePrompt(
  keyword: string,
  domain: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const anthropic = new Anthropic({ apiKey })

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 1024,
    temperature: 0.5,
    messages: [
      {
        role: 'user',
        content: `You are an expert at creating detailed prompts for DALL-E 3 image generation.

Create a highly detailed, specific prompt for generating a photorealistic hero image for a blog post about "${keyword}".

Research context about "${keyword}" and create a prompt that will result in an accurate, recognizable, photorealistic image.

Requirements:
- If it's a location (city, island, landmark), describe specific visual features that make it recognizable
- If it's a concept, describe a specific scene that represents it
- Include details about: lighting (golden hour, soft natural light), composition (wide shot, aerial view), weather, season, colors, mood
- Make it cinematic and magazine-quality
- No text, watermarks, or people's faces

Return ONLY the prompt text, nothing else. Make it 2-3 sentences maximum.`,
      },
    ],
  })

  const promptText =
    response.content[0].type === 'text' ? response.content[0].text : ''

  return promptText.trim()
}

/**
 * Generate hero image using DALL-E 3 with Claude-enhanced prompts
 */
async function generateHeroImage(
  keyword: string,
  domain: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const openai = new OpenAI({ apiKey })

  // Use Claude to create a detailed, accurate prompt
  const detailedPrompt = await generateImagePrompt(keyword, domain)

  // Add DALL-E specific instructions
  const finalPrompt = `${detailedPrompt}

Style: Professional photography, hyper-realistic, 8K quality, magazine cover worthy, cinematic composition`

  console.log('DALL-E 3 Image Prompt:', finalPrompt)

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: finalPrompt,
      size: '1792x1024', // Wide format perfect for hero images
      quality: 'hd', // High quality
      n: 1,
    })

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E 3')
    }

    return imageUrl
  } catch (error) {
    console.error('DALL-E 3 image generation error:', error)
    throw error
  }
}
