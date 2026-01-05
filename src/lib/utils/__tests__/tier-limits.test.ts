import {
  hasReachedLimit,
  getRemainingQuota,
  validateTierLimit,
  getTierLimit,
  TIER_LIMITS,
} from '../tier-limits'

describe('Tier Limits', () => {
  describe('hasReachedLimit', () => {
    it('should return true when limit is reached for free tier projects', () => {
      expect(hasReachedLimit('free', 'projects', 1)).toBe(true)
      expect(hasReachedLimit('free', 'projects', 2)).toBe(true)
    })

    it('should return false when under limit for free tier projects', () => {
      expect(hasReachedLimit('free', 'projects', 0)).toBe(false)
    })

    it('should return true when limit is reached for free tier keywords', () => {
      expect(hasReachedLimit('free', 'keywords', 5)).toBe(true)
      expect(hasReachedLimit('free', 'keywords', 6)).toBe(true)
    })

    it('should return false when under limit for free tier keywords', () => {
      expect(hasReachedLimit('free', 'keywords', 0)).toBe(false)
      expect(hasReachedLimit('free', 'keywords', 4)).toBe(false)
    })

    it('should handle pro tier limits correctly', () => {
      expect(hasReachedLimit('pro', 'projects', 10)).toBe(true)
      expect(hasReachedLimit('pro', 'projects', 9)).toBe(false)
      expect(hasReachedLimit('pro', 'keywords', 100)).toBe(true)
      expect(hasReachedLimit('pro', 'keywords', 99)).toBe(false)
    })
  })

  describe('getRemainingQuota', () => {
    it('should calculate remaining quota correctly for free tier', () => {
      expect(getRemainingQuota('free', 'projects', 0)).toBe(1)
      expect(getRemainingQuota('free', 'projects', 1)).toBe(0)
      expect(getRemainingQuota('free', 'keywords', 2)).toBe(3)
      expect(getRemainingQuota('free', 'keywords', 5)).toBe(0)
    })

    it('should never return negative quota', () => {
      expect(getRemainingQuota('free', 'projects', 5)).toBe(0)
      expect(getRemainingQuota('free', 'keywords', 10)).toBe(0)
    })

    it('should handle pro tier quota correctly', () => {
      expect(getRemainingQuota('pro', 'keywords', 50)).toBe(50)
      expect(getRemainingQuota('pro', 'aiChecks', 10)).toBe(40)
    })
  })

  describe('validateTierLimit', () => {
    it('should throw error when free tier project limit exceeded', () => {
      expect(() => validateTierLimit('free', 'projects', 1)).toThrow(
        "You've reached your free tier limit of 1 projects. Please upgrade to add more."
      )
    })

    it('should throw error when free tier keyword limit exceeded', () => {
      expect(() => validateTierLimit('free', 'keywords', 5)).toThrow(
        "You've reached your free tier limit of 5 keywords. Please upgrade to add more."
      )
    })

    it('should not throw when under limit', () => {
      expect(() => validateTierLimit('free', 'projects', 0)).not.toThrow()
      expect(() => validateTierLimit('free', 'keywords', 4)).not.toThrow()
    })

    it('should handle pro tier validation correctly', () => {
      expect(() => validateTierLimit('pro', 'keywords', 99)).not.toThrow()
      expect(() => validateTierLimit('pro', 'keywords', 100)).toThrow()
    })
  })

  describe('getTierLimit', () => {
    it('should return correct limits for free tier', () => {
      expect(getTierLimit('free', 'projects')).toBe(1)
      expect(getTierLimit('free', 'keywords')).toBe(5)
      expect(getTierLimit('free', 'aiChecks')).toBe(1)
      expect(getTierLimit('free', 'contentGeneration')).toBe(1)
      expect(getTierLimit('free', 'rankChecks')).toBe('manual')
    })

    it('should return correct limits for all tiers', () => {
      expect(getTierLimit('starter', 'projects')).toBe(3)
      expect(getTierLimit('pro', 'keywords')).toBe(100)
      expect(getTierLimit('agency', 'keywords')).toBe(500)
    })
  })

  describe('TIER_LIMITS constant', () => {
    it('should have all required tiers', () => {
      expect(TIER_LIMITS).toHaveProperty('free')
      expect(TIER_LIMITS).toHaveProperty('starter')
      expect(TIER_LIMITS).toHaveProperty('pro')
      expect(TIER_LIMITS).toHaveProperty('agency')
    })

    it('should have all required properties for each tier', () => {
      const requiredProps = [
        'projects',
        'keywords',
        'aiChecks',
        'contentGeneration',
        'rankChecks',
      ]

      Object.keys(TIER_LIMITS).forEach((tier) => {
        requiredProps.forEach((prop) => {
          expect(TIER_LIMITS[tier as keyof typeof TIER_LIMITS]).toHaveProperty(prop)
        })
      })
    })
  })
})
