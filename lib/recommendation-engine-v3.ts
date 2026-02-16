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

  // Hospital cover scoring (most important - 40 points)
  if (preferences.hospitalLevel) {
    const hospitalScore = scoringSpec.feature_scoring.hospital_cover[preferences.hospitalLevel] || 0
    const weightedScore = hospitalScore * (scoringSpec.weights.hospital_cover / 2) // Normalize to 0-40
    breakdown['hospital_cover'] = weightedScore
    score += weightedScore

    // Flag if hospital cover is NULL
    if (plan.hospital_cover === null || plan.hospital_cover === undefined) {
      verificationFlags.push('Hospital cover not verified')
    }
  }

  // Outpatient cover scoring (25 points)
  if (preferences.outpatientCover !== undefined) {
    const outpatientScore = preferences.outpatientCover ? 1 : 0
    const weightedScore = outpatientScore * scoringSpec.weights.outpatient // 25 points if yes, 0 if no
    breakdown['outpatient_cover'] = weightedScore
    score += weightedScore

    if (plan.outpatient_cover === null || plan.outpatient_cover === undefined) {
      verificationFlags.push('Outpatient cover not verified')
    }
  }

  // GP visits scoring (included in outpatient weight)
  if (preferences.gpVisits !== undefined) {
    const gpScore = preferences.gpVisits ? 1 : 0
    const weightedScore = gpScore * (scoringSpec.weights.outpatient / 2) // Split with outpatient
    breakdown['gp_visits'] = weightedScore
    score += weightedScore

    if (plan.gp_visits === null || plan.gp_visits === undefined) {
      verificationFlags.push('GP visits not verified')
    }
  }

  // Maternity cover scoring (15 points)
  if (preferences.maternityNeeded !== undefined) {
    const maternityScore = preferences.maternityNeeded ? 1 : 0
    const weightedScore = maternityScore * 15 // 15 points if yes, 0 if no
    breakdown['maternity_cover'] = weightedScore
    score += weightedScore

    if (plan.maternity_cover === null || plan.maternity_cover === undefined) {
      verificationFlags.push('Maternity cover not verified')
    }
  }

  // Mental health scoring (15 points)
  if (preferences.mentalHealthCover !== undefined) {
    const mentalScore = preferences.mentalHealthCover ? 1 : 0
    const weightedScore = mentalScore * scoringSpec.weights.mental_health // 15 points if yes, 0 if no
    breakdown['mental_health'] = weightedScore
    score += weightedScore

    if (plan.mental_health === null || plan.mental_health === undefined) {
      verificationFlags.push('Mental health cover not verified')
    }
  }

  // Overseas coverage scoring (10 points)
  if (preferences.overseasCoverage !== undefined) {
    const overseasScore = preferences.overseasCoverage ? 1 : 0
    const weightedScore = overseasScore * scoringSpec.weights.overseas_emergency // 10 points if yes, 0 if no
    breakdown['overseas_emergency'] = weightedScore
    score += weightedScore

    if (plan.overseas_emergency === null || plan.overseas_emergency === undefined) {
      verificationFlags.push('Overseas emergency cover not verified')
    }
  }

  return {
    score,
    breakdown,
    verificationFlags,
  }
}

/**
 * Apply elimination rules (hard filters)
 * Only eliminate if explicitly false; keep null and flag for verification
 */
function applyEliminationRules(
  plans: HealthInsurancePlan[],
  preferences: UserPreferences
): HealthInsurancePlan[] {
  return plans.filter((plan) => {
    // Maternity: eliminate only if explicitly false and user needs it
    if (preferences.maternityNeeded === true && plan.maternity_cover === false) {
      return false
    }

    // Mental health: eliminate only if explicitly false and user needs it
    if (preferences.mentalHealthCover === true && plan.mental_health === false) {
      return false
    }

    // Overseas: eliminate only if explicitly false and user needs it
    if (preferences.overseasCoverage === true && plan.overseas_emergency === false) {
      return false
    }

    // Keep all others (including nulls - they'll be flagged for verification)
    return true
  })
}

/**
 * Compare two plans for sorting (tie-breaker logic)
 * 1. Higher score wins
 * 2. If within 5 points, higher completeness_score wins
 * 3. If still tied, fewer verification flags wins
 */
function comparePlans(
  a: { plan: HealthInsurancePlan; score: number; verificationFlags: string[] },
  b: { plan: HealthInsurancePlan; score: number; verificationFlags: string[] }
): number {
  // Primary: higher score wins
  if (Math.abs(a.score - b.score) > 5) {
    return b.score - a.score
  }

  // Secondary: if within 5 points, higher completeness_score wins
  const aCompleteness = a.plan.completeness_score || 0
  const bCompleteness = b.plan.completeness_score || 0
  if (aCompleteness !== bCompleteness) {
    return bCompleteness - aCompleteness
  }

  // Tertiary: fewer verification flags wins
  return a.verificationFlags.length - b.verificationFlags.length
}

/**
 * Main recommendation engine
 * Processes all 272 plans and returns top 5 recommendations
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

  return {
    totalPlans,
    avgCompleteness: Math.round(avgCompleteness * 100) / 100,
    byInsurer,
    generatedAt: new Date().toISOString(),
  }
}
