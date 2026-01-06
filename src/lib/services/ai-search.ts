/**
 * AI Search Tracking Service
 * Checks if user's website is mentioned/cited in AI chatbot responses
 */

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export type AIPlatform = 'claude' | 'chatgpt' | 'perplexity' | 'gemini'

export type AISearchResult = {
  platform: AIPlatform
  query: string
  is_cited: boolean
  response_text: string
  citation_context?: string // The text around where domain was mentioned
  checked_at: string
}

/**
 * Generate a natural language query from a keyword
 */
function generateQuery(keyword: string): string {
  const templates = [
    `Who are the best ${keyword}?`,
    `Can you recommend ${keyword}?`,
    `What are the top ${keyword}?`,
    `I'm looking for ${keyword}. What do you suggest?`,
  ]

  // Use a simple hash to consistently pick the same template for a keyword
  const hash = keyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return templates[hash % templates.length]
}

/**
 * Check if domain is mentioned in text
 */
function checkCitation(text: string, domain: string): {
  is_cited: boolean
  citation_context?: string
} {
  // Clean domain for comparison (remove www, protocol, etc.)
  const cleanDomain = domain
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/$/, '')

  // Check for domain mention in various forms
  const patterns = [
    cleanDomain,
    `www.${cleanDomain}`,
    `https://${cleanDomain}`,
    `http://${cleanDomain}`,
    cleanDomain.replace(/\.[^.]+$/, ''), // Domain without TLD
  ]

  const lowerText = text.toLowerCase()

  for (const pattern of patterns) {
    if (lowerText.includes(pattern)) {
      // Extract context around the citation (100 chars before and after)
      const index = lowerText.indexOf(pattern)
      const start = Math.max(0, index - 100)
      const end = Math.min(text.length, index + pattern.length + 100)
      const context = text.substring(start, end)

      return {
        is_cited: true,
        citation_context: `...${context}...`,
      }
    }
  }

  return { is_cited: false }
}

/**
 * Check Claude (Anthropic)
 */
async function checkClaude(
  query: string,
  domain: string
): Promise<AISearchResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const anthropic = new Anthropic({ apiKey })

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
    })

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : ''

    const citation = checkCitation(responseText, domain)

    return {
      platform: 'claude',
      query,
      is_cited: citation.is_cited,
      response_text: responseText,
      citation_context: citation.citation_context,
      checked_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Claude API error:', error)
    throw error
  }
}

/**
 * Check ChatGPT (OpenAI)
 */
async function checkChatGPT(
  query: string,
  domain: string
): Promise<AISearchResult> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const openai = new OpenAI({ apiKey })

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    })

    const responseText = response.choices[0]?.message?.content || ''

    const citation = checkCitation(responseText, domain)

    return {
      platform: 'chatgpt',
      query,
      is_cited: citation.is_cited,
      response_text: responseText,
      citation_context: citation.citation_context,
      checked_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

/**
 * Check AI search citation for a keyword
 */
export async function checkAISearch(
  keyword: string,
  domain: string,
  platforms: AIPlatform[] = ['claude', 'chatgpt']
): Promise<AISearchResult[]> {
  const query = generateQuery(keyword)
  const results: AISearchResult[] = []
  const errors: string[] = []

  for (const platform of platforms) {
    try {
      let result: AISearchResult

      switch (platform) {
        case 'claude':
          result = await checkClaude(query, domain)
          break

        case 'chatgpt':
          result = await checkChatGPT(query, domain)
          break

        case 'perplexity':
          // TODO: Implement Perplexity API
          throw new Error('Perplexity API not yet implemented')

        case 'gemini':
          // TODO: Implement Gemini API
          throw new Error('Gemini API not yet implemented')

        default:
          throw new Error(`Unknown platform: ${platform}`)
      }

      results.push(result)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Error checking ${platform}:`, errorMsg)
      errors.push(`${platform}: ${errorMsg}`)
    }
  }

  // If all platforms failed, throw an error
  if (results.length === 0 && errors.length > 0) {
    throw new Error(`All AI platforms failed: ${errors.join(', ')}`)
  }

  return results
}

/**
 * Calculate AI citation rate from recent checks
 */
export function calculateCitationRate(
  checks: Array<{ is_cited: boolean }>
): number {
  if (checks.length === 0) return 0

  const cited = checks.filter((check) => check.is_cited).length
  return Math.round((cited / checks.length) * 100)
}
