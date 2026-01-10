/**
 * Website SEO Analysis Service
 * Crawls website, analyzes pages, and generates SEO scores
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'

type CrawledPage = {
  url: string
  title: string | null
  meta_description: string | null
  h1: string | null
  canonical_url: string | null
  word_count: number
  readability_score: number | null
  status_code: number
  load_time_ms: number
  page_size_kb: number
  has_robots_meta: boolean
  is_indexable: boolean
  has_og_tags: boolean
  has_twitter_cards: boolean
  has_schema_markup: boolean
  total_images: number
  images_without_alt: number
  internal_links: number
  external_links: number
  broken_links: number
}

type SEOIssue = {
  severity: 'critical' | 'warning' | 'info'
  category: 'technical' | 'content' | 'mobile' | 'ai_chatbot'
  issue_type: string
  description: string
  recommendation: string | null
  page_url: string | null
}

type AnalysisScores = {
  technical_score: number
  content_score: number
  mobile_score: number
  ai_chatbot_score: number
  overall_score: number
}

const MAX_PAGES = 50
const TIMEOUT_MS = 30000

/**
 * Main function to analyze a website
 */
export async function analyzeWebsite(
  domain: string,
  analysisId: string,
  supabase: SupabaseClient
): Promise<void> {
  console.log(`Starting analysis for ${domain}`)

  try {
    // Ensure domain has protocol
    const normalizedDomain = domain.startsWith('http')
      ? domain
      : `https://${domain}`

    // Crawl the website
    const pages = await crawlWebsite(normalizedDomain)

    console.log(`Crawled ${pages.length} pages`)

    // Analyze each page and collect issues
    const allIssues: SEOIssue[] = []

    for (const page of pages) {
      // Analyze the page
      const pageIssues = analyzePage(page, normalizedDomain)
      allIssues.push(...pageIssues)

      // Store crawled page in database
      await supabase.from('crawled_pages').insert({
        analysis_id: analysisId,
        ...page,
      })
    }

    // Calculate scores
    const scores = calculateScores(pages, allIssues)

    // Store issues in database
    for (const issue of allIssues) {
      await supabase.from('seo_issues').insert({
        analysis_id: analysisId,
        ...issue,
      })
    }

    // Count issues by severity
    const criticalIssues = allIssues.filter((i) => i.severity === 'critical').length
    const warnings = allIssues.filter((i) => i.severity === 'warning').length

    // Update analysis with results
    await supabase
      .from('website_analyses')
      .update({
        status: 'completed',
        pages_crawled: pages.length,
        total_issues: allIssues.length,
        critical_issues: criticalIssues,
        warnings,
        ...scores,
        completed_at: new Date().toISOString(),
      })
      .eq('id', analysisId)

    console.log(`Analysis completed for ${domain}`)
  } catch (error) {
    console.error('Analysis failed:', error)
    throw error
  }
}

/**
 * Crawl website pages
 */
async function crawlWebsite(baseUrl: string): Promise<CrawledPage[]> {
  const crawledPages: CrawledPage[] = []
  const urlsToCrawl = new Set([baseUrl])
  const crawledUrls = new Set<string>()

  while (urlsToCrawl.size > 0 && crawledPages.length < MAX_PAGES) {
    const url = Array.from(urlsToCrawl)[0]
    urlsToCrawl.delete(url)

    if (crawledUrls.has(url)) continue
    crawledUrls.add(url)

    try {
      const page = await crawlPage(url, baseUrl)
      crawledPages.push(page)

      // Extract internal links to crawl
      // (simplified - in production use a proper crawler)
      // For now, we'll just crawl the homepage
    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error)
    }
  }

  return crawledPages
}

/**
 * Crawl a single page
 */
async function crawlPage(url: string, baseUrl: string): Promise<CrawledPage> {
  const startTime = Date.now()

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; SEOBot/1.0; +https://example.com/bot)',
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })

  const loadTime = Date.now() - startTime
  const html = await response.text()
  const $ = cheerio.load(html)

  // Extract page data
  const title = $('title').text().trim() || null
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() || null
  const h1 = $('h1').first().text().trim() || null
  const canonicalUrl = $('link[rel="canonical"]').attr('href') || null

  // Count words in body
  const bodyText = $('body').text()
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length

  // Check for SEO elements
  const hasRobotsMeta = $('meta[name="robots"]').length > 0
  const robotsContent = $('meta[name="robots"]').attr('content') || ''
  const isIndexable = !robotsContent.includes('noindex')

  const hasOgTags = $('meta[property^="og:"]').length > 0
  const hasTwitterCards = $('meta[name^="twitter:"]').length > 0
  const hasSchemaMarkup =
    $('script[type="application/ld+json"]').length > 0 ||
    $('[itemscope]').length > 0

  // Count images
  const images = $('img')
  const totalImages = images.length
  const imagesWithoutAlt = images.filter((_, img) => !$(img).attr('alt')).length

  // Count links
  const links = $('a[href]')
  let internalLinks = 0
  let externalLinks = 0

  links.each((_, link) => {
    const href = $(link).attr('href') || ''
    if (href.startsWith(baseUrl) || href.startsWith('/')) {
      internalLinks++
    } else if (href.startsWith('http')) {
      externalLinks++
    }
  })

  // Get page size
  const pageSizeKb = Math.round(Buffer.byteLength(html, 'utf8') / 1024)

  return {
    url,
    title,
    meta_description: metaDescription,
    h1,
    canonical_url: canonicalUrl,
    word_count: wordCount,
    readability_score: null, // TODO: implement readability calculation
    status_code: response.status,
    load_time_ms: loadTime,
    page_size_kb: pageSizeKb,
    has_robots_meta: hasRobotsMeta,
    is_indexable: isIndexable,
    has_og_tags: hasOgTags,
    has_twitter_cards: hasTwitterCards,
    has_schema_markup: hasSchemaMarkup,
    total_images: totalImages,
    images_without_alt: imagesWithoutAlt,
    internal_links: internalLinks,
    external_links: externalLinks,
    broken_links: 0, // TODO: implement broken link detection
  }
}

/**
 * Analyze a page and generate issues
 */
function analyzePage(page: CrawledPage, baseUrl: string): SEOIssue[] {
  const issues: SEOIssue[] = []

  // Technical SEO checks
  if (!page.title) {
    issues.push({
      severity: 'critical',
      category: 'technical',
      issue_type: 'Missing Title',
      description: 'Page is missing a title tag',
      recommendation: 'Add a descriptive title tag (50-60 characters)',
      page_url: page.url,
    })
  } else if (page.title.length < 30 || page.title.length > 60) {
    issues.push({
      severity: 'warning',
      category: 'technical',
      issue_type: 'Title Length',
      description: `Title is ${page.title.length} characters (recommended: 50-60)`,
      recommendation: 'Adjust title length to 50-60 characters for better display in search results',
      page_url: page.url,
    })
  }

  if (!page.meta_description) {
    issues.push({
      severity: 'critical',
      category: 'technical',
      issue_type: 'Missing Meta Description',
      description: 'Page is missing a meta description',
      recommendation: 'Add a compelling meta description (150-160 characters)',
      page_url: page.url,
    })
  } else if (
    page.meta_description.length < 120 ||
    page.meta_description.length > 160
  ) {
    issues.push({
      severity: 'warning',
      category: 'technical',
      issue_type: 'Meta Description Length',
      description: `Meta description is ${page.meta_description.length} characters (recommended: 150-160)`,
      recommendation:
        'Adjust meta description length to 150-160 characters',
      page_url: page.url,
    })
  }

  if (!page.h1) {
    issues.push({
      severity: 'critical',
      category: 'technical',
      issue_type: 'Missing H1',
      description: 'Page is missing an H1 heading',
      recommendation:
        'Add a single H1 heading that clearly describes the page content',
      page_url: page.url,
    })
  }

  // Content checks
  if (page.word_count < 300) {
    issues.push({
      severity: 'warning',
      category: 'content',
      issue_type: 'Thin Content',
      description: `Page has only ${page.word_count} words (recommended: 300+)`,
      recommendation:
        'Add more high-quality content to provide value to users and search engines',
      page_url: page.url,
    })
  }

  // Image checks
  if (page.images_without_alt > 0) {
    issues.push({
      severity: 'warning',
      category: 'technical',
      issue_type: 'Images Without Alt Text',
      description: `${page.images_without_alt} images are missing alt text`,
      recommendation:
        'Add descriptive alt text to all images for accessibility and SEO',
      page_url: page.url,
    })
  }

  // Open Graph checks
  if (!page.has_og_tags) {
    issues.push({
      severity: 'info',
      category: 'technical',
      issue_type: 'Missing Open Graph Tags',
      description: 'Page is missing Open Graph meta tags',
      recommendation:
        'Add Open Graph tags for better social media sharing (og:title, og:description, og:image)',
      page_url: page.url,
    })
  }

  // Schema markup check (AI chatbot optimization)
  if (!page.has_schema_markup) {
    issues.push({
      severity: 'warning',
      category: 'ai_chatbot',
      issue_type: 'Missing Schema Markup',
      description: 'Page is missing structured data (Schema.org markup)',
      recommendation:
        'Add JSON-LD structured data to help AI chatbots understand your content',
      page_url: page.url,
    })
  }

  // Performance checks
  if (page.load_time_ms > 3000) {
    issues.push({
      severity: 'warning',
      category: 'mobile',
      issue_type: 'Slow Load Time',
      description: `Page load time is ${page.load_time_ms}ms (recommended: <3000ms)`,
      recommendation:
        'Optimize images, minify CSS/JS, and leverage browser caching to improve load time',
      page_url: page.url,
    })
  }

  return issues
}

/**
 * Calculate SEO scores
 */
function calculateScores(
  pages: CrawledPage[],
  issues: SEOIssue[]
): AnalysisScores {
  // Count issues by category
  const technicalIssues = issues.filter((i) => i.category === 'technical')
  const contentIssues = issues.filter((i) => i.category === 'content')
  const mobileIssues = issues.filter((i) => i.category === 'mobile')
  const aiChatbotIssues = issues.filter((i) => i.category === 'ai_chatbot')

  // Calculate scores (100 - deductions based on issues)
  const technicalScore = Math.max(
    0,
    100 -
      technicalIssues.filter((i) => i.severity === 'critical').length * 10 -
      technicalIssues.filter((i) => i.severity === 'warning').length * 5
  )

  const contentScore = Math.max(
    0,
    100 -
      contentIssues.filter((i) => i.severity === 'critical').length * 10 -
      contentIssues.filter((i) => i.severity === 'warning').length * 5
  )

  const mobileScore = Math.max(
    0,
    100 -
      mobileIssues.filter((i) => i.severity === 'critical').length * 10 -
      mobileIssues.filter((i) => i.severity === 'warning').length * 5
  )

  const aiChatbotScore = Math.max(
    0,
    100 -
      aiChatbotIssues.filter((i) => i.severity === 'critical').length * 10 -
      aiChatbotIssues.filter((i) => i.severity === 'warning').length * 5
  )

  // Calculate weighted overall score
  // Technical: 30%, Content: 35%, Mobile: 20%, AI Chatbot: 15%
  const overallScore = Math.round(
    technicalScore * 0.3 +
      contentScore * 0.35 +
      mobileScore * 0.2 +
      aiChatbotScore * 0.15
  )

  return {
    technical_score: Math.round(technicalScore),
    content_score: Math.round(contentScore),
    mobile_score: Math.round(mobileScore),
    ai_chatbot_score: Math.round(aiChatbotScore),
    overall_score: overallScore,
  }
}
