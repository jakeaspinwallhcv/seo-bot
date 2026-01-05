/**
 * Tier Limits and Usage Validation
 *
 * Security: All limits enforced on both client and server side
 * Client-side: UX feedback
 * Server-side: Database constraints + application validation
 */

export const TIER_LIMITS = {
  free: {
    projects: 1,
    keywords: 5,
    aiChecks: 1, // per month
    contentGeneration: 1, // per month
    rankChecks: 'manual', // manual only, no automated
  },
  starter: {
    projects: 3,
    keywords: 25,
    aiChecks: 10,
    contentGeneration: 10,
    rankChecks: 'daily',
  },
  pro: {
    projects: 10,
    keywords: 100,
    aiChecks: 50,
    contentGeneration: 50,
    rankChecks: 'daily',
  },
  agency: {
    projects: 50,
    keywords: 500,
    aiChecks: 200,
    contentGeneration: 200,
    rankChecks: 'daily',
  },
} as const

export type SubscriptionTier = keyof typeof TIER_LIMITS

/**
 * Check if user has reached their tier limit for a resource
 *
 * @param tier - User's subscription tier
 * @param resourceType - Type of resource to check
 * @param currentCount - Current usage count
 * @returns boolean - True if limit reached
 */
export function hasReachedLimit(
  tier: SubscriptionTier,
  resourceType: keyof Omit<typeof TIER_LIMITS.free, 'rankChecks'>,
  currentCount: number
): boolean {
  const limit = TIER_LIMITS[tier][resourceType]

  if (typeof limit === 'number') {
    return currentCount >= limit
  }

  return false
}

/**
 * Get remaining quota for a resource
 *
 * @param tier - User's subscription tier
 * @param resourceType - Type of resource
 * @param currentCount - Current usage count
 * @returns number - Remaining quota
 */
export function getRemainingQuota(
  tier: SubscriptionTier,
  resourceType: keyof Omit<typeof TIER_LIMITS.free, 'rankChecks'>,
  currentCount: number
): number {
  const limit = TIER_LIMITS[tier][resourceType]

  if (typeof limit === 'number') {
    return Math.max(0, limit - currentCount)
  }

  return 0
}

/**
 * Validate if action is allowed based on tier limits
 * Throws error with user-friendly message if limit exceeded
 *
 * @param tier - User's subscription tier
 * @param resourceType - Type of resource
 * @param currentCount - Current usage count
 * @throws Error if limit exceeded
 */
export function validateTierLimit(
  tier: SubscriptionTier,
  resourceType: keyof Omit<typeof TIER_LIMITS.free, 'rankChecks'>,
  currentCount: number
): void {
  if (hasReachedLimit(tier, resourceType, currentCount)) {
    const limit = TIER_LIMITS[tier][resourceType]
    throw new Error(
      `You've reached your ${tier} tier limit of ${limit} ${resourceType}. Please upgrade to add more.`
    )
  }
}

/**
 * Get tier limit for a specific resource
 *
 * @param tier - User's subscription tier
 * @param resourceType - Type of resource
 * @returns number | string - The limit value
 */
export function getTierLimit(
  tier: SubscriptionTier,
  resourceType: keyof typeof TIER_LIMITS.free
): number | string {
  return TIER_LIMITS[tier][resourceType]
}
