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

type CrawlerSettings = {
  maxPages: number
  timeoutMs: number
  rateLimitMs: number
  respectRobotsTxt: boolean
  followNofollowLinks: boolean
  crawlStrategy: 'breadth_first' | 'depth_first'
}

type RobotsRules = {
  allowed: string[]
  disallowed: string[]
  crawlDelay?: number
}

const MAX_PAGES = 50
const TIMEOUT_MS = 30000
const RATE_LIMIT_MS = 1000

// ============================================================================
// URL UTILITIES
// ============================================================================

/**
 * Normalize URL for deduplication
 * - Removes fragments (#section)
 * - Sorts query parameters
 * - Removes trailing slash (except root)
 * - Converts to lowercase
 */
function normalizeUrl(url: string, baseUrl: string): string {
  try {
    const absoluteUrl = new URL(url, baseUrl)

    // Remove fragment
    absoluteUrl.hash = ''

    // Sort query params
    const params = Array.from(absoluteUrl.searchParams.entries()).sort(
      ([a], [b]) => a.localeCompare(b)
    )
    absoluteUrl.search = ''
    params.forEach(([key, value]) => absoluteUrl.searchParams.append(key, value))

    // Remove trailing slash (except for root)
    let pathname = absoluteUrl.pathname
    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1)
    }
    absoluteUrl.pathname = pathname

    return absoluteUrl.toString().toLowerCase()
  } catch (error) {
    return ''
  }
}

/**
 * Check if URL is same domain as base URL
 */
function isSameDomain(url: string, baseUrl: string): boolean {
  try {
    const urlObj = new URL(url)
    const baseObj = new URL(baseUrl)
    return urlObj.hostname === baseObj.hostname
  } catch {
    return false
  }
}

/**
 * Check if hostname is a private IP address (SSRF protection)
 * Blocks: localhost, 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
 */
function isPrivateIP(hostname: string): boolean {
  // Private IP ranges to block
  const privateRanges = [
    /^127\./,                          // 127.0.0.0/8 (localhost)
    /^192\.168\./,                     // 192.168.0.0/16 (private)
    /^10\./,                           // 10.0.0.0/8 (private)
    /^172\.(1[6-9]|2\d|3[01])\./,     // 172.16.0.0/12 (private)
    /^169\.254\./,                     // 169.254.0.0/16 (link-local)
    /^localhost$/i,                    // localhost hostname
    /^::1$/,                           // IPv6 localhost
    /^fe80:/i,                         // IPv6 link-local
    /^fc00:/i,                         // IPv6 unique local
    /^fd00:/i,                         // IPv6 unique local
  ]

  // Check against all private ranges
  return privateRanges.some(regex => regex.test(hostname))
}

/**
 * Match URL against wildcard pattern
 * Supports * (any characters) and ? (single character)
 *
 * Security: Validates pattern length and compilation time to prevent ReDoS attacks
 */
function matchesPattern(url: string, pattern: string): boolean {
  // Enforce maximum pattern length to prevent memory issues
  if (pattern.length > 100) {
    throw new Error('Pattern too long (maximum 100 characters)')
  }

  // Track regex compilation time to detect complex patterns
  const startTime = Date.now()

  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
    .replace(/\*/g, '.*') // * matches any characters
    .replace(/\?/g, '.') // ? matches single character

  const regex = new RegExp(`^${regexPattern}$`, 'i')

  // Check if compilation took too long (indicates complexity)
  if (Date.now() - startTime > 100) {
    throw new Error('Pattern too complex (compilation timeout)')
  }

  return regex.test(url)
}

/**
 * Check if URL should be excluded based on patterns
 */
function isUrlExcluded(url: string, exclusionPatterns: string[]): boolean {
  return exclusionPatterns.some((pattern) => matchesPattern(url, pattern))
}

// ============================================================================
// SITEMAP PARSING
// ============================================================================

/**
 * Parse sitemap.xml and extract URLs
 */
async function parseSitemap(url: string): Promise<string[]> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!response.ok) return []

    const xml = await response.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    const urls: string[] = []
    $('url > loc').each((_, elem) => {
      const loc = $(elem).text().trim()
      if (loc) urls.push(loc)
    })

    console.log(`Found ${urls.length} URLs in sitemap: ${url}`)
    return urls
  } catch (error) {
    console.log(`Could not parse sitemap ${url}:`, error)
    return []
  }
}

/**
 * Parse sitemap_index.xml and extract all URLs from child sitemaps
 */
async function parseSitemapIndex(url: string): Promise<string[]> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!response.ok) return []

    const xml = await response.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    const allUrls: string[] = []
    const sitemapUrls: string[] = []

    $('sitemap > loc').each((_, elem) => {
      const loc = $(elem).text().trim()
      if (loc) sitemapUrls.push(loc)
    })

    console.log(`Found ${sitemapUrls.length} sitemaps in index`)

    // Parse each sitemap
    for (const sitemapUrl of sitemapUrls) {
      const urls = await parseSitemap(sitemapUrl)
      allUrls.push(...urls)
    }

    return allUrls
  } catch (error) {
    console.log(`Could not parse sitemap index ${url}:`, error)
    return []
  }
}

/**
 * Find sitemap URLs in robots.txt
 */
async function findSitemapsInRobotsTxt(url: string): Promise<string[]> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!response.ok) return []

    const text = await response.text()
    const sitemaps: string[] = []

    const lines = text.split('\n')
    for (const line of lines) {
      const match = line.match(/^Sitemap:\s*(.+)$/i)
      if (match) {
        sitemaps.push(match[1].trim())
      }
    }

    return sitemaps
  } catch (error) {
    console.log(`Could not parse robots.txt ${url}:`, error)
    return []
  }
}

/**
 * Discover URLs via sitemap or fallback to homepage
 */
async function discoverUrls(baseUrl: string): Promise<string[]> {
  // Try sitemap.xml
  const sitemapUrls = await parseSitemap(`${baseUrl}/sitemap.xml`)
  if (sitemapUrls.length > 0) {
    console.log(`Using sitemap.xml with ${sitemapUrls.length} URLs`)
    return sitemapUrls
  }

  // Try sitemap_index.xml
  const indexUrls = await parseSitemapIndex(`${baseUrl}/sitemap_index.xml`)
  if (indexUrls.length > 0) {
    console.log(`Using sitemap_index.xml with ${indexUrls.length} URLs`)
    return indexUrls
  }

  // Try robots.txt
  const robotsSitemaps = await findSitemapsInRobotsTxt(`${baseUrl}/robots.txt`)
  if (robotsSitemaps.length > 0) {
    console.log(`Found ${robotsSitemaps.length} sitemaps in robots.txt`)
    const allUrls: string[] = []
    for (const sitemapUrl of robotsSitemaps) {
      const urls = await parseSitemap(sitemapUrl)
      allUrls.push(...urls)
    }
    if (allUrls.length > 0) {
      return allUrls
    }
  }

  // Fall back to homepage
  console.log('No sitemap found, starting from homepage')
  return [baseUrl]
}

// ============================================================================
// ROBOTS.TXT COMPLIANCE
// ============================================================================

/**
 * Parse robots.txt and extract rules
 */
async function parseRobotsTxt(baseUrl: string): Promise<RobotsRules> {
  try {
    const response = await fetch(`${baseUrl}/robots.txt`, {
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return { allowed: [], disallowed: [] }
    }

    const text = await response.text()
    const rules: RobotsRules = { allowed: [], disallowed: [] }

    let isRelevantUserAgent = false
    const lines = text.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed.startsWith('User-agent:')) {
        const agent = trimmed.substring(11).trim()
        isRelevantUserAgent = agent === '*' || agent.toLowerCase() === 'seobot'
      } else if (isRelevantUserAgent) {
        if (trimmed.startsWith('Disallow:')) {
          const path = trimmed.substring(9).trim()
          if (path) rules.disallowed.push(path)
        } else if (trimmed.startsWith('Allow:')) {
          const path = trimmed.substring(6).trim()
          if (path) rules.allowed.push(path)
        } else if (trimmed.startsWith('Crawl-delay:')) {
          const delay = parseInt(trimmed.substring(12).trim())
          if (!isNaN(delay)) rules.crawlDelay = delay * 1000
        }
      }
    }

    console.log(
      `Robots.txt: ${rules.disallowed.length} disallow rules, ${rules.allowed.length} allow rules`
    )
    return rules
  } catch (error) {
    console.log('Could not parse robots.txt:', error)
    return { allowed: [], disallowed: [] }
  }
}

/**
 * Match path against robots.txt pattern
 */
function matchesRobotsPattern(path: string, pattern: string): boolean {
  // Robots.txt patterns: * for wildcard, $ for end of URL
  const regexPattern = pattern
    .replace(/[.+^{}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\$$/g, '$')

  const regex = new RegExp(`^${regexPattern}`)
  return regex.test(path)
}

/**
 * Check if URL is allowed by robots.txt
 */
function isAllowedByRobots(
  url: string,
  rules: RobotsRules,
  baseUrl: string
): boolean {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname

    // Check if explicitly allowed
    for (const allowPattern of rules.allowed) {
      if (matchesRobotsPattern(path, allowPattern)) {
        return true
      }
    }

    // Check if disallowed
    for (const disallowPattern of rules.disallowed) {
      if (matchesRobotsPattern(path, disallowPattern)) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

// ============================================================================
// LINK EXTRACTION
// ============================================================================

/**
 * Extract links from HTML content
 */
async function extractLinks(
  html: string,
  pageUrl: string,
  baseUrl: string,
  followNofollow: boolean
): Promise<string[]> {
  const $ = cheerio.load(html)
  const links: string[] = []

  $('a[href]').each((_, elem) => {
    const href = $(elem).attr('href')
    const rel = $(elem).attr('rel') || ''

    if (!href) return

    // Skip nofollow links unless configured to follow
    if (!followNofollow && rel.includes('nofollow')) return

    // Skip javascript:, mailto:, tel: links
    if (
      href.startsWith('javascript:') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return
    }

    try {
      const absoluteUrl = new URL(href, pageUrl)
      if (
        absoluteUrl.protocol === 'http:' ||
        absoluteUrl.protocol === 'https:'
      ) {
        links.push(absoluteUrl.toString())
      }
    } catch {
      // Invalid URL, skip
    }
  })

  return links
}

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

    // Get project ID from analysis
    const { data: analysis } = await supabase
      .from('website_analyses')
      .select('project_id')
      .eq('id', analysisId)
      .single()

    if (!analysis) {
      throw new Error('Analysis not found')
    }

    // Get project settings
    const { data: project } = await supabase
      .from('projects')
      .select('crawler_settings')
      .eq('id', analysis.project_id)
      .single()

    const settings: CrawlerSettings = project?.crawler_settings || {
      maxPages: MAX_PAGES,
      timeoutMs: TIMEOUT_MS,
      rateLimitMs: RATE_LIMIT_MS,
      respectRobotsTxt: true,
      followNofollowLinks: false,
      crawlStrategy: 'breadth_first',
    }

    // Get exclusion patterns
    const { data: patternsData } = await supabase
      .from('crawler_exclusion_patterns')
      .select('pattern')
      .eq('project_id', analysis.project_id)
      .eq('is_active', true)

    const exclusionPatterns = patternsData?.map((p) => p.pattern) || []
    console.log(`Loaded ${exclusionPatterns.length} exclusion patterns`)

    // Crawl the website
    const pages = await crawlWebsite(
      normalizedDomain,
      exclusionPatterns,
      settings
    )

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
 * Crawl website pages with full BFS algorithm
 */
async function crawlWebsite(
  baseUrl: string,
  exclusionPatterns: string[],
  settings: CrawlerSettings
): Promise<CrawledPage[]> {
  const crawledPages: CrawledPage[] = []
  const urlQueue: string[] = []
  const crawledUrls = new Set<string>()
  const failedUrls = new Set<string>()
  const htmlCache = new Map<string, string>()

  console.log('Discovering URLs...')
  // Discover initial URLs (sitemap or homepage)
  const initialUrls = await discoverUrls(baseUrl)
  urlQueue.push(...initialUrls)

  // Parse robots.txt if needed
  let robotsRules: RobotsRules | null = null
  if (settings.respectRobotsTxt) {
    robotsRules = await parseRobotsTxt(baseUrl)
  }

  const rateLimitMs = robotsRules?.crawlDelay || settings.rateLimitMs

  console.log('Starting crawl with BFS strategy...')
  while (urlQueue.length > 0 && crawledPages.length < settings.maxPages) {
    const url = urlQueue.shift()!
    const normalizedUrl = normalizeUrl(url, baseUrl)

    // Skip if already processed
    if (crawledUrls.has(normalizedUrl) || failedUrls.has(normalizedUrl)) {
      continue
    }

    // Skip if not same domain
    if (!isSameDomain(normalizedUrl, baseUrl)) {
      continue
    }

    // Skip if excluded by patterns
    if (isUrlExcluded(normalizedUrl, exclusionPatterns)) {
      console.log(`Excluded by pattern: ${normalizedUrl}`)
      continue
    }

    // Skip if disallowed by robots.txt
    if (robotsRules && !isAllowedByRobots(normalizedUrl, robotsRules, baseUrl)) {
      console.log(`Disallowed by robots.txt: ${normalizedUrl}`)
      continue
    }

    crawledUrls.add(normalizedUrl)

    try {
      // Rate limiting
      if (crawledPages.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, rateLimitMs))
      }

      // Crawl the page
      const { page, html } = await crawlPageWithHtml(
        normalizedUrl,
        baseUrl,
        settings.timeoutMs
      )
      crawledPages.push(page)
      htmlCache.set(normalizedUrl, html)

      // Extract links from page HTML
      const links = await extractLinks(
        html,
        normalizedUrl,
        baseUrl,
        settings.followNofollowLinks
      )

      // Add new links to queue (BFS: add to end)
      for (const link of links) {
        const normalizedLink = normalizeUrl(link, baseUrl)
        if (
          !crawledUrls.has(normalizedLink) &&
          !failedUrls.has(normalizedLink)
        ) {
          if (settings.crawlStrategy === 'breadth_first') {
            urlQueue.push(normalizedLink)
          } else {
            urlQueue.unshift(normalizedLink) // DFS: add to front
          }
        }
      }

      console.log(
        `Crawled ${normalizedUrl} (${crawledPages.length}/${settings.maxPages})`
      )
    } catch (error) {
      console.error(`Failed to crawl ${normalizedUrl}:`, error)
      failedUrls.add(normalizedUrl)
    }
  }

  console.log(`Crawl complete: ${crawledPages.length} pages, ${failedUrls.size} failures`)
  return crawledPages
}

/**
 * Crawl a single page and return both page data and HTML
 */
async function crawlPageWithHtml(
  url: string,
  baseUrl: string,
  timeoutMs: number
): Promise<{ page: CrawledPage; html: string }> {
  const startTime = Date.now()

  // SSRF Protection: Block private IP addresses
  try {
    const urlObj = new URL(url)
    if (isPrivateIP(urlObj.hostname)) {
      throw new Error(
        `Cannot crawl private IP address: ${urlObj.hostname}. This is blocked for security reasons.`
      )
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid URL: ${url}`)
    }
    throw error
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; SEOBot/1.0; +https://example.com/bot)',
    },
    signal: AbortSignal.timeout(timeoutMs),
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
    page: {
      url,
      title,
      meta_description: metaDescription,
      h1,
      canonical_url: canonicalUrl,
      word_count: wordCount,
      readability_score: null,
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
      broken_links: 0,
    },
    html,
  }
}

/**
 * Analyze a page and generate issues
 */

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
