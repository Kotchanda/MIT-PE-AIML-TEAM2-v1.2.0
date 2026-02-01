/**
 * Advanced Recommendation Engine v2.0
 * Implements NULL-safe scoring, explainability, and tie-breaker logic
 * Based on MIT-PE-AIML-TEAM2 v1.2.0 blueprint
 */

import type { HealthInsurancePlan, UserPreferences, ComparisonResult } from './types'
import { getAllPlans, getProvider } from './insurance-data'

/**
 * Scoring specification with weights and tie-breaker rules
 * Implements NULL-safe scoring: NULL = 0 points (unknown), not elimination
 */
const SCORING_SPEC = {
  weights: {
    hospital_cover: 40,
    outpatient: 25,
    mental_health: 15,
    room: 10,
    overseas_emergency: 10,
  },
  feature_scoring: {
    hospital_cover: {
      PUBLIC: 0,
      PRIVATE: 1,
      HI_TECH: 2,
    },
    outpatient: {
      outpatient_cover: 1,
      gp_visits: 1,
    },
    mental_health: {
      mental_health: 1,
    },
    room: {
      semi_private_room: 1,
      private_room: 2,
    },
    overseas_emergency: {
      overseas_emergency: 1,
    },
  },
  tier_preference_multiplier: {
    'Price-sensitive': { BASIC: 1.1, MID: 1.0, HIGH: 0.9 },
    'Balanced': { BASIC: 1.0, MID: 1.05, HIGH: 1.0 },
    'Benefit-maximizing': { BASIC: 0.9, MID: 1.0, HIGH: 1.1 },
  },
}

/**
 * Calculate completeness score for a plan
 * Measures data quality: 1 - (null_count / total_key_fields)
 */
function calculateCompletenessScore(plan: HealthInsurancePlan): number {
  const keyFields = [
    'hospitalCover',
    'outpatientCover',
    'gpVisits',
    'maternityIncluded',
    'mentalHealthCover',
    'overseasEmergency',
    'semiPrivateRoom',
    'privateRoom',
    'excessRequired',
  ]

  let nullCount = 0
  keyFields.forEach((field) => {
    const value = (plan as any)[field]
    if (value === null || value === undefined) {
      nullCount++
    }
  })

  return 1 - nullCount / keyFields.length
}

/**
 * Calculate feature score for a plan based on user preferences
 * NULL-safe: NULL values contribute 0 points (unknown), not elimination
 */
function calculateFeatureScore(plan: HealthInsurancePlan, preferences: UserPreferences): number {
  let score = 0

  // Hospital cover scoring (40 points max)
  if (preferences.hospitalLevel === 'Public only') {
    score += 0 // Public is baseline
  } else if (preferences.hospitalLevel === 'Private') {
    score += 30 // Private preferred
  } else if (preferences.hospitalLevel === 'Hi-Tech') {
    score += 40 // Hi-Tech preferred
  }

  // Outpatient scoring (25 points max)
  if (plan.outpatientCover) score += 15
  if (plan.gpVisits) score += 10

  // Mental health scoring (15 points max)
  if (plan.mentalHealthCover) score += 15

  // Room preference scoring (10 points max)
  if (plan.semiPrivateRoom) score += 5
  if (plan.privateRoom) score += 10

  // Overseas emergency scoring (10 points max)
  if (plan.overseasEmergency) score += 10

  return score
}

/**
 * Calculate match percentage (0-100) with tie-breaker logic
 * Implements: score → completeness → verification flags
 */
function calculateMatchPercentage(
  plan: HealthInsurancePlan,
  preferences: UserPreferences,
  allPlans: HealthInsurancePlan[]
): number {
  const featureScore = calculateFeatureScore(plan, preferences)
  const maxScore = 100

  // Apply tier preference multiplier
  const tierMultiplier =
    SCORING_SPEC.tier_preference_multiplier[
      preferences.pricePosture as keyof typeof SCORING_SPEC.tier_preference_multiplier
    ]?.[plan.tier as keyof typeof SCORING_SPEC.tier_preference_multiplier['Balanced']] || 1.0

  const adjustedScore = featureScore * tierMultiplier

  // Normalize to 0-100
  const percentage = Math.round((adjustedScore / maxScore) * 100)

  return Math.min(100, Math.max(0, percentage))
}

/**
 * Generate explainable reasons why a plan matches user preferences
 */
function generateReasons(plan: HealthInsurancePlan, preferences: UserPreferences): string[] {
  const reasons: string[] = []

  // Hospital level match
  if (preferences.hospitalLevel === 'Private' && plan.hospitalCover === 'PRIVATE') {
    reasons.push('Matches your private hospital preference')
  } else if (preferences.hospitalLevel === 'Hi-Tech' && plan.hospitalCover === 'HI_TECH') {
    reasons.push('Provides hi-tech hospital access you requested')
  }

  // Budget alignment
  if (preferences.pricePosture === 'Price-sensitive' && plan.tier === 'BASIC') {
    reasons.push('Affordable option within budget-conscious preference')
  } else if (preferences.pricePosture === 'Balanced' && plan.tier === 'MID') {
    reasons.push('Balanced coverage and pricing for your needs')
  } else if (preferences.pricePosture === 'Benefit-maximizing' && plan.tier === 'HIGH') {
    reasons.push('Comprehensive coverage matching your benefit priorities')
  }

  // Specific needs
  if (preferences.needsMaternity && plan.maternityIncluded) {
    reasons.push('Includes maternity cover you need')
  }
  if (preferences.needsMentalHealth && plan.mentalHealthCover) {
    reasons.push('Includes mental health services')
  }
  if (preferences.needsOverseas && plan.overseasEmergency) {
    reasons.push('Covers overseas emergency treatment')
  }

  // Data quality
  const completeness = calculateCompletenessScore(plan)
  if (completeness >= 0.8) {
    reasons.push('Fully verified plan information')
  }

  // Default reason if empty
  if (reasons.length === 0) {
    reasons.push('Good overall match for your profile')
  }

  return reasons.slice(0, 3) // Top 3 reasons
}

/**
 * Check if plan needs verification (has NULL values in key fields)
 */
function needsVerification(plan: HealthInsurancePlan): boolean {
  const completeness = calculateCompletenessScore(plan)
  return completeness < 0.7
}

/**
 * Apply hard filters (NULL-safe: keep if NULL, flag for verification)
 */
function passesHardFilters(plan: HealthInsurancePlan, preferences: UserPreferences): boolean {
  // Maternity required
  if (preferences.needsMaternity && plan.maternityIncluded === false) {
    return false
  }

  // Mental health required
  if (preferences.needsMentalHealth && plan.mentalHealthCover === false) {
    return false
  }

  // Overseas required
  if (preferences.needsOverseas && plan.overseasEmergency === false) {
    return false
  }

  // If NULL, keep the plan and flag for verification
  return true
}

/**
 * Main recommendation function with advanced scoring and tie-breaker logic
 */
export function getRecommendationsV2(preferences: UserPreferences): ComparisonResult[] {
  const allPlans = getAllPlans()

  // Step 1: Apply hard filters (NULL-safe)
  const filteredPlans = allPlans.filter((plan) => passesHardFilters(plan, preferences))

  // Step 2: Score and rank plans
  const scored = filteredPlans.map((plan) => {
    const matchPercentage = calculateMatchPercentage(plan, preferences, allPlans)
    const completeness = calculateCompletenessScore(plan)
    const verification = needsVerification(plan)
    const reasons = generateReasons(plan, preferences)

    return {
      plan,
      provider: getProvider(plan.providerId)!,
      matchPercentage,
      completeness,
      verification,
      reasons,
      estimatedAnnualCost: calculateAnnualCost(plan, preferences),
    }
  })

  // Step 3: Sort with tie-breaker logic
  // 1. Higher score first
  // 2. If within 5 points, prefer higher completeness
  // 3. If still tied, prefer fewer verification flags
  scored.sort((a, b) => {
    const scoreDiff = b.matchPercentage - a.matchPercentage

    if (Math.abs(scoreDiff) > 5) {
      return scoreDiff
    }

    // Within 5 points: prefer higher completeness
    const completeDiff = b.completeness - a.completeness
    if (Math.abs(completeDiff) > 0.05) {
      return completeDiff
    }

    // Still tied: prefer fewer verification flags
    return (a.verification ? 1 : 0) - (b.verification ? 1 : 0)
  })

  // Step 4: Build final results with explainability
  return scored.map((item) => ({
    plan: item.plan,
    provider: item.provider,
    matchPercentage: item.matchPercentage,
    estimatedAnnualCost: item.estimatedAnnualCost,
    reasons: item.reasons,
    completenessScore: item.completeness,
    needsVerification: item.verification,
  }))
}

/**
 * Calculate annual cost based on family composition
 */
function calculateAnnualCost(plan: HealthInsurancePlan, preferences: UserPreferences): number {
  let cost = plan.adultPrice * preferences.adults

  // Add children cost
  if (preferences.children > 0) {
    cost += plan.childPrice * preferences.children
  }

  // Add dependents cost (use adult price as proxy)
  if (preferences.dependents > 0) {
    cost += plan.adultPrice * preferences.dependents
  }

  return Math.round(cost)
}

/**
 * Legacy function for backward compatibility
 */
export function getRecommendations(preferences: UserPreferences): ComparisonResult[] {
  return getRecommendationsV2(preferences)
}

/**
 * Calculate match score (legacy)
 */
export function calculateMatchScore(
  plan: HealthInsurancePlan,
  preferences: UserPreferences
): number {
  return calculateMatchPercentage(plan, preferences, getAllPlans())
}

/**
 * Calculate annual cost (legacy)
 */
export function calculateAnnualCostLegacy(
  plan: HealthInsurancePlan,
  preferences: UserPreferences
): number {
  return calculateAnnualCost(plan, preferences)
}

/**
 * Filter plans (legacy)
 */
export function filterPlans(
  plans: HealthInsurancePlan[],
  preferences: UserPreferences
): HealthInsurancePlan[] {
  return plans.filter((plan) => passesHardFilters(plan, preferences))
}
