/**
 * Recommendation Engine for Irish Health Insurance
 * Analyzes user preferences and recommends best matching plans
 */

import type { UserPreferences, ComparisonResult, HealthInsurancePlan } from './types'
import { getAllPlans, getProvider } from './insurance-data'

/**
 * Calculate match score based on user preferences
 * Returns a score from 0-100 indicating how well the plan matches user needs
 */
export function calculateMatchScore(
  plan: HealthInsurancePlan,
  preferences: UserPreferences
): number {
  let score = 0
  let maxScore = 0

  // Budget matching (30 points max)
  maxScore += 30
  const estimatedCost = calculateAnnualCost(plan, preferences)
  if (estimatedCost <= preferences.budget) {
    score += 30
  } else if (estimatedCost <= preferences.budget * 1.2) {
    score += 20
  } else if (estimatedCost <= preferences.budget * 1.5) {
    score += 10
  }

  // Coverage matching (40 points max)
  maxScore += 40
  const coverageScore = calculateCoverageScore(plan, preferences)
  score += coverageScore

  // Tier matching (20 points max)
  maxScore += 20
  if (preferences.budget < 1500) {
    if (plan.tier === 'basic') score += 20
    else if (plan.tier === 'standard') score += 10
  } else if (preferences.budget < 2000) {
    if (plan.tier === 'standard') score += 20
    else if (plan.tier === 'basic' || plan.tier === 'premium') score += 10
  } else {
    if (plan.tier === 'premium') score += 20
    else if (plan.tier === 'standard') score += 10
  }

  // Normalize to 0-100
  return Math.round((score / maxScore) * 100)
}

/**
 * Calculate coverage score based on user priorities
 */
function calculateCoverageScore(plan: HealthInsurancePlan, preferences: UserPreferences): number {
  let score = 0
  const priorityMap: Record<string, keyof typeof plan.coverage> = {
    'inpatient': 'inpatient',
    'outpatient': 'outpatient',
    'gp': 'gp',
    'dental': 'dental',
    'optical': 'optical',
    'mental': 'mental',
    'physiotherapy': 'physiotherapy',
    'day-patient': 'dayPatient',
  }

  // Check each priority
  preferences.priorities.forEach(priority => {
    const coverageKey = priorityMap[priority]
    if (coverageKey && plan.coverage[coverageKey]) {
      score += 40 / Math.max(preferences.priorities.length, 1)
    }
  })

  return Math.round(score)
}

/**
 * Calculate estimated annual cost based on family composition
 */
export function calculateAnnualCost(plan: HealthInsurancePlan, preferences: UserPreferences): number {
  let cost = 0

  // Add adult cost (user)
  cost += plan.adultPrice

  // Add spouse/partner if applicable
  if (preferences.familySize > 1) {
    cost += plan.adultPrice
  }

  // Add children costs
  if (preferences.dependents > 0) {
    cost += plan.childPrice * preferences.dependents
  }

  return cost
}

/**
 * Generate recommendation reasons
 */
function generateReasons(
  plan: HealthInsurancePlan,
  preferences: UserPreferences,
  matchScore: number
): string[] {
  const reasons: string[] = []
  const estimatedCost = calculateAnnualCost(plan, preferences)

  // Budget reasons
  if (estimatedCost <= preferences.budget) {
    reasons.push(`✓ Within budget (€${estimatedCost}/year)`)
  } else {
    const difference = estimatedCost - preferences.budget
    reasons.push(`€${difference}/year above budget`)
  }

  // Coverage reasons
  if (preferences.priorities.includes('inpatient') && plan.coverage.inpatient) {
    reasons.push('✓ Includes inpatient hospital cover')
  }
  if (preferences.priorities.includes('gp') && plan.coverage.gp) {
    reasons.push('✓ Includes GP visits')
  }
  if (preferences.priorities.includes('dental') && plan.coverage.dental) {
    reasons.push('✓ Includes dental coverage')
  }
  if (preferences.priorities.includes('mental') && plan.coverage.mental) {
    reasons.push('✓ Includes mental health support')
  }

  // Specific needs
  if (preferences.specificNeeds.includes('family') && plan.familyPrice) {
    reasons.push('✓ Good family coverage option')
  }
  if (preferences.specificNeeds.includes('children') && plan.childPrice < 600) {
    reasons.push('✓ Affordable children\'s coverage')
  }

  // Excess
  if (plan.excess === 0) {
    reasons.push('✓ No excess on claims')
  } else if (plan.excess < 100) {
    reasons.push(`✓ Low excess (€${plan.excess})`)
  }

  // Waiting period
  if (plan.waitingPeriod === 0) {
    reasons.push('✓ No waiting period for switchers')
  }

  return reasons.slice(0, 4) // Return top 4 reasons
}

/**
 * Get recommendations for user preferences
 * Returns top matching plans sorted by match score
 */
export function getRecommendations(preferences: UserPreferences): ComparisonResult[] {
  const allPlans = getAllPlans()

  // Calculate scores for all plans
  const results: ComparisonResult[] = allPlans.map(plan => {
    const score = calculateMatchScore(plan, preferences)
    const estimatedCost = calculateAnnualCost(plan, preferences)
    const provider = getProvider(plan.providerId)

    return {
      plan,
      provider: provider!,
      score,
      matchPercentage: score,
      reasons: generateReasons(plan, preferences, score),
      estimatedAnnualCost: estimatedCost,
    }
  })

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score)
}

/**
 * Filter plans by criteria
 */
export function filterPlans(
  plans: HealthInsurancePlan[],
  criteria: {
    maxPrice?: number
    minCoverage?: string[]
    provider?: string
    tier?: string
  }
): HealthInsurancePlan[] {
  return plans.filter(plan => {
    // Price filter
    if (criteria.maxPrice && plan.adultPrice > criteria.maxPrice) {
      return false
    }

    // Provider filter
    if (criteria.provider && plan.providerId !== criteria.provider) {
      return false
    }

    // Tier filter
    if (criteria.tier && plan.tier !== criteria.tier) {
      return false
    }

    // Coverage filter
    if (criteria.minCoverage) {
      const coverageMap: Record<string, keyof typeof plan.coverage> = {
        'inpatient': 'inpatient',
        'outpatient': 'outpatient',
        'gp': 'gp',
        'dental': 'dental',
        'optical': 'optical',
        'mental': 'mental',
        'physiotherapy': 'physiotherapy',
        'day-patient': 'dayPatient',
      }

      const hasAllCoverage = criteria.minCoverage.every(coverage => {
        const key = coverageMap[coverage]
        return key && plan.coverage[key]
      })

      if (!hasAllCoverage) {
        return false
      }
    }

    return true
  })
}
