/**
 * Onboarding Validation Schemas
 *
 * Security measures:
 * - Input sanitization via Zod transforms
 * - Length limits to prevent DoS
 * - URL validation to prevent XSS
 * - Domain validation with regex
 * - Trim whitespace to prevent injection
 */

import { z } from 'zod'

// Security: Domain regex to prevent malicious input
const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i

// Security: Validate URL format and prevent javascript: protocol
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Step 1: Add Project
 * Security: Trim inputs, enforce length limits, validate domain format
 */
export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .refine(
      (name) => !name.includes('<') && !name.includes('>'),
      'Project name cannot contain HTML tags'
    ),
  domain: z
    .string()
    .trim()
    .min(1, 'Domain is required')
    .max(253, 'Domain must be less than 253 characters') // DNS limit
    .toLowerCase()
    .refine((domain) => {
      // Remove protocol if provided
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
      return DOMAIN_REGEX.test(cleanDomain)
    }, 'Please enter a valid domain (e.g., example.com)'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
})

export type ProjectFormData = z.infer<typeof projectSchema>

/**
 * Step 2: Add Keywords
 * Security: Trim, validate length, prevent injection
 */
export const keywordsSchema = z.object({
  keywords: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Keyword cannot be empty')
        .max(100, 'Keyword must be less than 100 characters')
        .refine(
          (keyword) => !keyword.includes('<') && !keyword.includes('>'),
          'Keywords cannot contain HTML tags'
        )
    )
    .min(1, 'Add at least 1 keyword')
    .max(5, 'Free tier allows maximum 5 keywords'), // Enforced for free tier
})

export type KeywordsFormData = z.infer<typeof keywordsSchema>

/**
 * Step 3: Add Competitors (Optional)
 * Security: Validate domain format, enforce limits
 */
export const competitorsSchema = z.object({
  competitors: z
    .array(
      z
        .string()
        .trim()
        .toLowerCase()
        .max(253, 'Domain must be less than 253 characters')
        .refine((domain) => {
          if (!domain) return true // Allow empty
          const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
          return DOMAIN_REGEX.test(cleanDomain)
        }, 'Please enter a valid domain')
    )
    .max(3, 'Maximum 3 competitors allowed'),
})

export type CompetitorsFormData = z.infer<typeof competitorsSchema>

/**
 * Combined onboarding data
 */
export const onboardingDataSchema = z.object({
  project: projectSchema,
  keywords: keywordsSchema,
  competitors: competitorsSchema.optional(),
})

export type OnboardingData = z.infer<typeof onboardingDataSchema>

/**
 * Helper: Sanitize domain input
 * Removes protocol, trailing slashes, paths
 */
export function sanitizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '')
}

/**
 * Helper: Validate and parse keyword input
 * Handles comma-separated, newline-separated, or mixed input
 */
export function parseKeywordInput(input: string): string[] {
  return input
    .split(/[,\n]+/) // Split by comma or newline
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .filter((k) => k.length <= 100) // Security: Enforce max length
    .slice(0, 5) // Security: Enforce free tier limit
}
