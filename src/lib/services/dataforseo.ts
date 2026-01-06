/**
 * DataForSEO API Integration
 * Docs: https://docs.dataforseo.com/v3/serp/google/organic/task_post/
 */

// Types for DataForSEO API
export type DataForSEOTaskRequest = {
  language_code: string // e.g., "en"
  location_code: number // e.g., 2840 for USA
  keyword: string
  device: 'desktop' | 'mobile'
  os?: string
  depth: number // Max results to return (100 max)
}

export type DataForSEOSerpItem = {
  type: string // "organic", "featured_snippet", "people_also_ask", etc.
  rank_group: number
  rank_absolute: number
  position: string
  xpath: string
  domain: string
  title: string
  url: string
  breadcrumb?: string
  is_image?: boolean
  is_video?: boolean
  is_featured_snippet?: boolean
  is_malicious?: boolean
  description?: string
  pre_snippet?: string
  extended_snippet?: string
  amp_version?: boolean
  rating?: {
    rating_type: string
    value: number
    votes_count: number
    rating_max: number
  }
  highlighted?: string[]
  links?: any[]
  faq?: any
  extended_people_also_search?: any[]
}

export type DataForSEOTaskResult = {
  keyword: string
  type: string
  se_domain: string
  location_code: number
  language_code: string
  check_url: string
  datetime: string
  spell?: any
  item_types: string[]
  se_results_count: number
  items_count: number
  items: DataForSEOSerpItem[]
}

export type DataForSEOResponse = {
  version: string
  status_code: number
  status_message: string
  time: string
  cost: number
  tasks_count: number
  tasks_error: number
  tasks: Array<{
    id: string
    status_code: number
    status_message: string
    time: string
    cost: number
    result_count: number
    path: string[]
    data: {
      api: string
      function: string
      se: string
      se_type: string
      language_code: string
      location_code: number
      keyword: string
      device: string
      os?: string
    }
    result: DataForSEOTaskResult[]
  }>
}

export type RankCheckResult = {
  rank: number | null
  url: string | null
  title: string | null
  serp_features: {
    featured_snippet: boolean
    people_also_ask: boolean
    local_pack: boolean
    knowledge_graph: boolean
    image_pack: boolean
    video_pack: boolean
  }
  total_results: number
  checked_at: string
}

/**
 * DataForSEO API Client
 */
export class DataForSEOClient {
  private username: string
  private password: string
  private baseUrl = 'https://api.dataforseo.com/v3'

  constructor(username: string, password: string) {
    this.username = username
    this.password = password
  }

  /**
   * Make authenticated request to DataForSEO API
   */
  private async makeRequest(
    endpoint: string,
    data: any
  ): Promise<DataForSEOResponse> {
    const auth = Buffer.from(`${this.username}:${this.password}`).toString(
      'base64'
    )

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.status_code !== 20000) {
      throw new Error(
        `DataForSEO API error: ${result.status_message || 'Unknown error'}`
      )
    }

    return result
  }

  /**
   * Check Google rank for a keyword and domain
   */
  async checkRank(
    keyword: string,
    domain: string,
    options: {
      locationCode?: number // Default: 2840 (USA)
      languageCode?: string // Default: "en"
      device?: 'desktop' | 'mobile' // Default: "desktop"
    } = {}
  ): Promise<RankCheckResult> {
    const {
      locationCode = 2840, // USA
      languageCode = 'en',
      device = 'desktop',
    } = options

    // Prepare request
    const requestData = [
      {
        language_code: languageCode,
        location_code: locationCode,
        keyword,
        device,
        depth: 100, // Check top 100 results
      },
    ]

    try {
      // Make API request
      const response = await this.makeRequest(
        '/serp/google/organic/live/advanced',
        requestData
      )

      if (!response.tasks || response.tasks.length === 0) {
        throw new Error('No results returned from DataForSEO')
      }

      const task = response.tasks[0]

      if (!task.result || task.result.length === 0) {
        throw new Error('No SERP results found')
      }

      const result = task.result[0]

      // Clean domain for comparison (remove www, protocol, trailing slash)
      const cleanDomain = (d: string) =>
        d
          .toLowerCase()
          .replace(/^(https?:\/\/)?(www\.)?/, '')
          .replace(/\/$/, '')

      const targetDomain = cleanDomain(domain)

      // Find the user's domain in results
      let rank: number | null = null
      let url: string | null = null
      let title: string | null = null

      for (const item of result.items) {
        if (item.type === 'organic') {
          const itemDomain = cleanDomain(item.domain)

          if (itemDomain === targetDomain || itemDomain.includes(targetDomain)) {
            rank = item.rank_absolute
            url = item.url
            title = item.title
            break
          }
        }
      }

      // Extract SERP features
      const serp_features = {
        featured_snippet: result.items.some(
          (item) => item.type === 'featured_snippet'
        ),
        people_also_ask: result.items.some(
          (item) => item.type === 'people_also_ask'
        ),
        local_pack: result.items.some((item) => item.type === 'local_pack'),
        knowledge_graph: result.items.some(
          (item) => item.type === 'knowledge_graph'
        ),
        image_pack: result.items.some((item) => item.type === 'images'),
        video_pack: result.items.some((item) => item.type === 'video'),
      }

      return {
        rank,
        url,
        title,
        serp_features,
        total_results: result.se_results_count,
        checked_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error('DataForSEO rank check error:', error)
      throw error
    }
  }

  /**
   * Get available locations
   * Useful for future multi-location tracking
   */
  async getLocations(search?: string): Promise<any> {
    const endpoint = '/serp/google/locations'
    const data = search ? [{ search }] : []

    return this.makeRequest(endpoint, data)
  }

  /**
   * Get available languages
   */
  async getLanguages(): Promise<any> {
    const endpoint = '/serp/google/languages'
    return this.makeRequest(endpoint, [])
  }
}

/**
 * Create DataForSEO client instance
 */
export function createDataForSEOClient(): DataForSEOClient {
  const username = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD

  if (!username || !password) {
    throw new Error(
      'DataForSEO credentials not configured. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables.'
    )
  }

  return new DataForSEOClient(username, password)
}
