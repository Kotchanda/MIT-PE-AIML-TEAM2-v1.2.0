/**
 * Recommendation Engine v3 - Full Blueprint Implementation
 * Processes 272 insurance plans with NULL-safe scoring, tie-breakers, and explainability
 * Based on MIT-PE-AIML-TEAM2 v1.2.0 blueprint
 */

import { getPlans, getScoringSpec, getBenefitDictionary } from './load-blueprint-data'
import type { UserPreferences, ComparisonResult, HealthInsurancePlan } from './types'

/**
 * Score a single plan against user preferences
 * Implements NULL-safe scoring: NULL fields contribute 0 points (unknown)
 * @param plan - Insurance plan to score
 * @param preferences - User preferences from quiz
 * @param scoringSpec - Scoring specification with feature weights
 * @returns Score object with total score and breakdown
 */
async function scorePlan(
  plan: HealthInsurancePlan,
  preferences: UserPreferences,
  scoringSpec: any
): Promise<{
  score: number
  breakdown: Record<string, number>
  verificationFlags: string[]
}> {
  const breakdown: Record<string, number> = {}
  const verificationFlags: string[] = []

  // Base score from tier preference
  let score = 0

  // Hospital cover scoring (most important)
  if (preferences.hospitalLevel) {
    const hospitalScore = scoringSpec.feature_scoring.hospital_cover[preferences.hospitalLevel] || 0
    breakdown['hospital_cover'] = hospitalScore
    score += hospitalScore

    // Flag if hospital cover is NULL
    if (plan.hospital_cover === null || plan.hospital_cover === undefined) {
      verificationFlags.push('Hospital cover not verified')
    }
  }

  // Outpatient cover scoring
  if (preferences.outpatientCover !== undefined) {
    const outpatientScore = preferences.outpatientCover
      ? scoringSpec.feature_scoring.outpatient_cover.yes || 10
      : scoringSpec.feature_scoring.outpatient_cover.no || 0
    breakdown['outpatient_cover'] = outpatientScore
    score += outpatientScore

    if (plan.outpatient_cover === null || plan.outpatient_cover === undefined) {
      verificationFlags.push('Outpatient cover not verified')
    }
  }

  // GP visits scoring
  if (preferences.gpVisits !== undefined) {
    const gpScore = preferences.gpVisits
      ? scoringSpec.feature_scoring.gp_visits.yes || 8
      : scoringSpec.feature_scoring.gp_visits.no || 0
    breakdown['gp_visits'] = gpScore
    score += gpScore

    if (plan.gp_visits === null || plan.gp_visits === undefined) {
      verificationFlags.push('GP visits not verified')
    }
  }

  // Maternity cover scoring
  if (preferences.maternityNeeded !== undefined) {
    const maternityScore = preferences.maternityNeeded
      ? scoringSpec.feature_scoring.maternity_cover.yes || 15
      : scoringSpec.feature_scoring.maternity_cover.no || 0
    breakdown['maternity_cover'] = maternityScore
    score += maternityScore

    if (plan.maternity_cover === null || plan.maternity_cover === undefined) {
      verificationFlags.push('Maternity cover not verified')
    }
  }

  // Mental health scoring
  if (preferences.mentalHealthCover !== undefined) {
    const mentalScore = preferences.mentalHealthCover
      ? scoringSpec.feature_scoring.mental_health.yes || 10
      : scoringSpec.feature_scoring.mental_health.no || 0
    breakdown['mental_health'] = mentalScore
    score += mentalScore

    if (plan.mental_health === null || plan.mental_health === undefined) {
      verificationFlags.push('Mental health cover not verified')
    }
  }

  // Overseas coverage scoring
  if (preferences.overseasCoverage !== undefined) {
    const overseasScore = preferences.overseasCoverage
      ? scoringSpec.feature_scoring.overseas_emergency.yes || 12
      : scoringSpec.feature_scoring.overseas_emergency.no || 0
    breakdown['overseas_emergency'] = overseasScore
    score += overseasScore

    if (plan.overseas_emergency === null || plan.overseas_emergency === undefined) {
      verificationFlags.push('Overseas coverage not verified')
    }
  }

  // Price sensitivity tier multiplier
  if (preferences.priceSensitivity) {
    const tierMultiplier = scoringSpec.tier_multipliers[plan.plan_tier] || 1.0
    score *= tierMultiplier
    breakdown['tier_multiplier'] = tierMultiplier
  }

  return {
    score: Math.round(score * 100) / 100,
    breakdown,
    verificationFlags,
  }
}

/**
 * Apply elimination rules (hard filters)
 * NULL-safe: only eliminate if value is definitively incompatible
 * @param plans - All plans to filter
 * @param preferences - User preferences
 * @returns Filtered plans that pass all hard filters
 */
function applyEliminationRules(
  plans: HealthInsurancePlan[],
  preferences: UserPreferences
): HealthInsurancePlan[] {
  return plans.filter((plan) => {
    // Must-have hospital cover
    if (preferences.hospitalLevel === 'PRIVATE' && plan.hospital_cover === 'PUBLIC') {
      return false // Eliminate: user wants private but plan only offers public
    }

    // Must-have maternity
    if (preferences.maternityNeeded && !plan.maternity_cover) {
      return false // Eliminate: user needs maternity but plan doesn't offer it
    }

    // Must-have mental health
    if (preferences.mentalHealthCover && !plan.mental_health) {
      return false // Eliminate: user needs mental health but plan doesn't offer it
    }

    // Must-have overseas coverage
    if (preferences.overseasCoverage && !plan.overseas_emergency) {
      return false // Eliminate: user needs overseas but plan doesn't offer it
    }

    // Keep plan if any field is NULL (unknown) - don't eliminate
    return true
  })
}

/**
 * Tie-breaker logic (when plans have similar scores)
 * 1. Highest score
 * 2. If within 5 points → prefer higher completeness_score
 * 3. If still tied → prefer fewer verification flags
 */
function comparePlans(
  a: { plan: HealthInsurancePlan; score: number; verificationFlags: string[] },
  b: { plan: HealthInsurancePlan; score: number; verificationFlags: string[] }
): number {
  // Rule 1: Highest score
  if (Math.abs(a.score - b.score) > 5) {
    return b.score - a.score
  }

  // Rule 2: If within 5 points, prefer higher completeness_score
  const aCompleteness = a.plan.completeness_score || 0
  const bCompleteness = b.plan.completeness_score || 0
  if (aCompleteness !== bCompleteness) {
    return bCompleteness - aCompleteness
  }

  // Rule 3: If still tied, prefer fewer verification flags
  return a.verificationFlags.length - b.verificationFlags.length
}

/**
 * Get recommendations for user preferences
 * Processes all 272 plans, applies filters, scores, and returns top recommendations
 * @param preferences - User preferences from quiz
 * @returns Top 5 recommendations with explanations
 */
export async function getRecommendationsV3(
  preferences: UserPreferences
): Promise<ComparisonResult[]> {
  try {
    // Load all data
    const allPlans = await getPlans()
    const scoringSpec = await getScoringSpec()

    console.log(`📊 Processing ${allPlans.length} insurance plans...`)

    // Step 1: Apply elimination rules (hard filters)
    const filteredPlans = applyEliminationRules(allPlans, preferences)
    console.log(`✅ After elimination: ${filteredPlans.length} plans remain`)

    // Step 2: Score each plan
    const scoredPlans = await Promise.all(
      filteredPlans.map(async (plan) => {
        const { score, breakdown, verificationFlags } = await scorePlan(
          plan,
          preferences,
          scoringSpec
        )
        return {
          plan,
          score,
          breakdown,
          verificationFlags,
        }
      })
    )

    // Step 3: Sort by tie-breaker logic
    scoredPlans.sort(comparePlans)

    // Step 4: Return top 5 recommendations
    const topRecommendations = scoredPlans.slice(0, 5)

    console.log(`🏆 Top recommendations:`)
    topRecommendations.forEach((rec, idx) => {
      console.log(`  ${idx + 1}. ${rec.plan.plan_name} (${rec.plan.insurer}) - Score: ${rec.score}`)
    })

    // Step 5: Build explainable results
    const results: ComparisonResult[] = topRecommendations.map((rec, index) => {
      // Calculate relative score (0-100)
      const maxScore = topRecommendations[0].score
      const relativeScore = Math.round((rec.score / maxScore) * 100)

      // Get top 3 drivers (features with highest contribution)
      const drivers = Object.entries(rec.breakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([feature, points]) => ({
          feature,
          points,
        }))

      // Get trade-offs vs runner-up
      const tradeOffs =
        index === 0 && topRecommendations.length > 1
          ? `vs ${topRecommendations[1].plan.plan_name}: ${Math.round(rec.score - topRecommendations[1].score)} points higher`
          : undefined

      return {
        plan: rec.plan,
        score: relativeScore,
        matchPercentage: relativeScore,
        drivers,
        tradeOffs,
        verificationNeeded: rec.verificationFlags.length > 0,
        verificationFlags: rec.verificationFlags,
        sourceUrl: rec.plan.source_url,
        completenessScore: rec.plan.completeness_score || 0,
      }
    })

    return results
  } catch (error) {
    console.error('❌ Error generating recommendations:', error)
    throw error
  }
}

/**
 * Get plan statistics for post-session panel
 * @returns Statistics about the plan dataset
 */
export async function getPlanStatistics() {
  const plans = await getPlans()

  const totalPlans = plans.length
  const avgCompleteness =
    plans.reduce((sum, p) => sum + (p.completeness_score || 0), 0) / totalPlans

  const byInsurer = plans.reduce(
    (acc, p) => {
      acc[p.insurer] = (acc[p.insurer] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const byTier = plans.reduce(
    (acc, p) => {
      acc[p.plan_tier] = (acc[p.plan_tier] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return {
    totalPlans,
    avgCompleteness: Math.round(avgCompleteness * 100),
    byInsurer,
    byTier,
  }
}
