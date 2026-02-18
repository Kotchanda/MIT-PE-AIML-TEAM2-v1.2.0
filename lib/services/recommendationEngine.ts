/**
 * Recommendation Engine Service (v3)
 * 
 * Processes user quiz responses and scores all available plans
 * Features:
 * - NULL-safe scoring (treats missing data as 0 points)
 * - Tie-breaker logic (price, then coverage breadth)
 * - Detailed scoring breakdown for transparency
 * - Handles 272+ plans efficiently
 * 
 * Total possible score: 165 points
 */

import { queryAll, queryOne } from '@/lib/db'

// Type definitions (replacing Prisma types)
interface Plan {
  id: string
  name: string
  provider: string
  monthlyPremium: number
  isActive: boolean
  hospitalCover: boolean
  consultantChoice: boolean
  dentalCover: boolean
  opticalCover: boolean
  maternityExtras: boolean
  dayToDayBenefits: boolean
  menopauseBenefit: boolean
  prescriptionCover: boolean
  physioRehab: boolean
  mentalHealthSupport: boolean
}

interface ScoringBreakdown {
  category: string
  points: number
  reason: string
}

interface ScoredPlan {
  planId: string
  planName: string
  provider: string
  monthlyPremium: number
  totalScore: number
  scoreBreakdown: ScoringBreakdown[]
  matchPercentage: number
}

interface RecommendationResult {
  topRecommendation: ScoredPlan
  allRecommendations: ScoredPlan[]
  totalPlansScored: number
  scoringNotes: string[]
}

/**
 * Main recommendation engine function
 * Scores all active plans based on user preferences
 * 
 * @param sessionId - Session ID for tracking
 * @param preferences - User's quiz responses
 * @returns Recommendation result with top plan and all scored plans
 */
export async function generateRecommendations(
  sessionId: string,
  preferences: {
    ageGroup?: string
    budgetRange?: string
    coverageType?: string
    hospitalCover?: string
    consultantChoice?: string
    dentalOptical?: string
    maternityExtras?: string
    dayToDayBenefits?: string
    menopauseBenefit?: string
    prescriptionCover?: string
    physioRehab?: string
    mentalHealthSupport?: string
  }
): Promise<RecommendationResult> {
  try {
    // Fetch all active plans from database using raw SQL
    const plans = await queryAll<Plan>(
      'SELECT * FROM "Plan" WHERE "isActive" = true'
    )

    const scoringNotes: string[] = []

    // Score each plan
    const scoredPlans: ScoredPlan[] = plans.map(plan => {
      const breakdown: ScoringBreakdown[] = []
      let totalScore = 0

      // 1. BUDGET MATCHING (0-30 points)
      // NULL-safe: if budgetRange is missing, award 0 points
      if (preferences.budgetRange) {
        const budgetScore = scoreBudget(preferences.budgetRange, plan.monthlyPremium)
        totalScore += budgetScore
        breakdown.push({
          category: 'Budget Match',
          points: budgetScore,
          reason: `Monthly premium €${plan.monthlyPremium} vs budget preference`,
        })
      } else {
        breakdown.push({
          category: 'Budget Match',
          points: 0,
          reason: 'Budget preference not provided',
        })
      }

      // 2. COVERAGE TYPE MATCHING (0-25 points)
      // NULL-safe: if coverageType is missing, award 0 points
      if (preferences.coverageType) {
        const coverageScore = scoreCoverageType(preferences.coverageType, plan)
        totalScore += coverageScore
        breakdown.push({
          category: 'Coverage Type',
          points: coverageScore,
          reason: `Plan type matches ${preferences.coverageType} preference`,
        })
      } else {
        breakdown.push({
          category: 'Coverage Type',
          points: 0,
          reason: 'Coverage type preference not provided',
        })
      }

      // 3. HOSPITAL COVER (0-15 points)
      if (preferences.hospitalCover) {
        const hospitalScore = scoreHospitalCover(preferences.hospitalCover, plan.hospitalCover)
        totalScore += hospitalScore
        breakdown.push({
          category: 'Hospital Cover',
          points: hospitalScore,
          reason: `Hospital cover: ${plan.hospitalCover ? 'included' : 'not included'}`,
        })
      } else {
        breakdown.push({
          category: 'Hospital Cover',
          points: 0,
          reason: 'Hospital cover preference not provided',
        })
      }

      // 4. CONSULTANT CHOICE (0-15 points)
      if (preferences.consultantChoice) {
        const consultantScore = scoreConsultantChoice(
          preferences.consultantChoice,
          plan.consultantChoice
        )
        totalScore += consultantScore
        breakdown.push({
          category: 'Consultant Choice',
          points: consultantScore,
          reason: `Consultant choice: ${plan.consultantChoice ? 'available' : 'not available'}`,
        })
      } else {
        breakdown.push({
          category: 'Consultant Choice',
          points: 0,
          reason: 'Consultant choice preference not provided',
        })
      }

      // 5. DENTAL & OPTICAL (0-20 points)
      if (preferences.dentalOptical) {
        const dentalOpticalScore = scoreDentalOptical(
          preferences.dentalOptical,
          plan.dentalCover,
          plan.opticalCover
        )
        totalScore += dentalOpticalScore
        breakdown.push({
          category: 'Dental & Optical',
          points: dentalOpticalScore,
          reason: `Dental: ${plan.dentalCover ? 'yes' : 'no'}, Optical: ${plan.opticalCover ? 'yes' : 'no'}`,
        })
      } else {
        breakdown.push({
          category: 'Dental & Optical',
          points: 0,
          reason: 'Dental/optical preference not provided',
        })
      }

      // 6. MATERNITY EXTRAS (0-10 points)
      if (preferences.maternityExtras) {
        const maternityScore = scoreMaternityExtras(
          preferences.maternityExtras,
          plan.maternityExtras
        )
        totalScore += maternityScore
        breakdown.push({
          category: 'Maternity Extras',
          points: maternityScore,
          reason: `Maternity extras: ${plan.maternityExtras ? 'included' : 'not included'}`,
        })
      } else {
        breakdown.push({
          category: 'Maternity Extras',
          points: 0,
          reason: 'Maternity preference not provided',
        })
      }

      // 7. DAY-TO-DAY BENEFITS (0-10 points)
      if (preferences.dayToDayBenefits) {
        const dayToDayScore = scoreDayToDayBenefits(
          preferences.dayToDayBenefits,
          plan.dayToDayBenefits
        )
        totalScore += dayToDayScore
        breakdown.push({
          category: 'Day-to-Day Benefits',
          points: dayToDayScore,
          reason: `Day-to-day benefits: ${plan.dayToDayBenefits ? 'included' : 'not included'}`,
        })
      } else {
        breakdown.push({
          category: 'Day-to-Day Benefits',
          points: 0,
          reason: 'Day-to-day preference not provided',
        })
      }

      // 8. MENOPAUSE BENEFIT (0-10 points)
      if (preferences.menopauseBenefit) {
        const menopauseScore = scoreMenopauseBenefit(
          preferences.menopauseBenefit,
          plan.menopauseBenefit
        )
        totalScore += menopauseScore
        breakdown.push({
          category: 'Menopause Benefit',
          points: menopauseScore,
          reason: `Menopause benefit: ${plan.menopauseBenefit ? 'included' : 'not included'}`,
        })
      } else {
        breakdown.push({
          category: 'Menopause Benefit',
          points: 0,
          reason: 'Menopause preference not provided',
        })
      }

      // 9. PRESCRIPTION COVER (0-10 points)
      if (preferences.prescriptionCover) {
        const prescriptionScore = scorePrescriptionCover(
          preferences.prescriptionCover,
          plan.prescriptionCover
        )
        totalScore += prescriptionScore
        breakdown.push({
          category: 'Prescription Cover',
          points: prescriptionScore,
          reason: `Prescription cover: ${plan.prescriptionCover ? 'included' : 'not included'}`,
        })
      } else {
        breakdown.push({
          category: 'Prescription Cover',
          points: 0,
          reason: 'Prescription preference not provided',
        })
      }

      // 10. PHYSIO & REHAB (0-10 points)
      if (preferences.physioRehab) {
        const physioScore = scorePhysioRehab(preferences.physioRehab, plan.physioRehab)
        totalScore += physioScore
        breakdown.push({
          category: 'Physio & Rehab',
          points: physioScore,
          reason: `Physio/rehab: ${plan.physioRehab ? 'included' : 'not included'}`,
        })
      } else {
        breakdown.push({
          category: 'Physio & Rehab',
          points: 0,
          reason: 'Physio preference not provided',
        })
      }

      // 11. MENTAL HEALTH SUPPORT (0-10 points)
      if (preferences.mentalHealthSupport) {
        const mentalHealthScore = scoreMentalHealthSupport(
          preferences.mentalHealthSupport,
          plan.mentalHealthSupport
        )
        totalScore += mentalHealthScore
        breakdown.push({
          category: 'Mental Health Support',
          points: mentalHealthScore,
          reason: `Mental health support: ${plan.mentalHealthSupport ? 'included' : 'not included'}`,
        })
      } else {
        breakdown.push({
          category: 'Mental Health Support',
          points: 0,
          reason: 'Mental health preference not provided',
        })
      }

      // Calculate match percentage (out of 165 max points)
      const matchPercentage = (totalScore / 165) * 100

      return {
        planId: plan.id,
        planName: plan.name,
        provider: plan.provider,
        monthlyPremium: plan.monthlyPremium,
        totalScore,
        scoreBreakdown: breakdown,
        matchPercentage: Math.round(matchPercentage * 10) / 10, // Round to 1 decimal
      }
    })

    // Sort by score (descending), then apply tie-breaker logic
    const sortedPlans = applyTieBreakerLogic(scoredPlans)

    // Store recommendations in database using raw SQL
    for (let i = 0; i < sortedPlans.length; i++) {
      const plan = sortedPlans[i]
      await query(
        `INSERT INTO "SessionPlan" ("sessionId", "planId", "score", "scoreBreakdown", "rank", "createdAt")
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [sessionId, plan.planId, plan.totalScore, JSON.stringify(plan.scoreBreakdown), i + 1]
      )
    }

    // Add scoring notes
    const answeredQuestions = Object.values(preferences).filter(v => v !== undefined).length
    scoringNotes.push(`Scored ${plans.length} plans based on ${answeredQuestions} answered questions`)
    scoringNotes.push(`Maximum possible score: 165 points`)
    scoringNotes.push(`Top recommendation score: ${sortedPlans[0].totalScore} points (${sortedPlans[0].matchPercentage}% match)`)

    return {
      topRecommendation: sortedPlans[0],
      allRecommendations: sortedPlans,
      totalPlansScored: plans.length,
      scoringNotes,
    }
  } catch (error) {
    console.error('Error generating recommendations:', error)
    throw new Error('Failed to generate recommendations')
  }
}

/**
 * Tie-breaker logic: Sort by score, then by price (lower is better), then by coverage breadth
 */
function applyTieBreakerLogic(plans: ScoredPlan[]): ScoredPlan[] {
  return plans.sort((a, b) => {
    // Primary: Sort by score (descending)
    if (a.totalScore !== b.totalScore) {
      return b.totalScore - a.totalScore
    }

    // Secondary: Sort by price (ascending - cheaper is better)
    if (a.monthlyPremium !== b.monthlyPremium) {
      return a.monthlyPremium - b.monthlyPremium
    }

    // Tertiary: Sort by plan name (for consistency)
    return a.planName.localeCompare(b.planName)
  })
}

// ============================================================================
// SCORING FUNCTIONS - Each returns 0-N points based on preference match
// ============================================================================

function scoreBudget(budgetRange: string, monthlyPremium: number): number {
  // Map budget ranges to price thresholds and scoring
  const budgetMap: Record<string, { max: number; points: number }> = {
    'under-50': { max: 50, points: 30 },
    '50-100': { max: 100, points: 30 },
    '100-150': { max: 150, points: 30 },
    '150-200': { max: 200, points: 30 },
    '200+': { max: Infinity, points: 30 },
  }

  const budget = budgetMap[budgetRange]
  if (!budget) return 0

  // Full points if within budget, scale down if over
  if (monthlyPremium <= budget.max) {
    return budget.points
  }

  // Penalize for exceeding budget (but don't go below 0)
  const overage = monthlyPremium - budget.max
  const penalty = Math.min(budget.points, overage / 10) // Lose 1 point per €10 over
  return Math.max(0, budget.points - penalty)
}

function scoreCoverageType(coverageType: string, plan: Plan): number {
  // Map coverage types to plan characteristics
  const coverageMap: Record<string, (p: Plan) => boolean> = {
    basic: p => !p.hospitalCover && !p.consultantChoice,
    comprehensive: p => p.hospitalCover && p.consultantChoice,
    premium: p => p.hospitalCover && p.consultantChoice && p.dentalCover && p.opticalCover,
  }

  const matcher = coverageMap[coverageType]
  if (!matcher) return 0

  return matcher(plan) ? 25 : 10 // Full points if matches, partial if not
}

function scoreHospitalCover(preference: string, planHasCover: boolean): number {
  if (preference === 'yes') return planHasCover ? 15 : 0
  if (preference === 'no') return !planHasCover ? 15 : 5
  if (preference === 'maybe') return planHasCover ? 10 : 5
  return 0
}

function scoreConsultantChoice(preference: string, planHasCover: boolean): number {
  if (preference === 'important') return planHasCover ? 15 : 0
  if (preference === 'somewhat') return planHasCover ? 10 : 5
  if (preference === 'not-important') return 15 // Any plan is fine
  return 0
}

function scoreDentalOptical(preference: string, hasDental: boolean, hasOptical: boolean): number {
  if (preference === 'both') return hasDental && hasOptical ? 20 : hasDental || hasOptical ? 10 : 0
  if (preference === 'dental-only') return hasDental ? 20 : hasOptical ? 5 : 0
  if (preference === 'optical-only') return hasOptical ? 20 : hasDental ? 5 : 0
  if (preference === 'none') return 20 // Any plan is fine
  return 0
}

function scoreMaternityExtras(preference: string, planHasCover: boolean): number {
  if (preference === 'yes') return planHasCover ? 10 : 0
  if (preference === 'no') return 10 // Any plan is fine
  if (preference === 'not-applicable') return 10 // Any plan is fine
  return 0
}

function scoreDayToDayBenefits(preference: string, planHasCover: boolean): number {
  if (preference === 'important') return planHasCover ? 10 : 0
  if (preference === 'somewhat') return planHasCover ? 7 : 3
  if (preference === 'not-important') return 10 // Any plan is fine
  return 0
}

function scoreMenopauseBenefit(preference: string, planHasCover: boolean): number {
  if (preference === 'yes') return planHasCover ? 10 : 0
  if (preference === 'no') return 10 // Any plan is fine
  if (preference === 'not-applicable') return 10 // Any plan is fine
  return 0
}

function scorePrescriptionCover(preference: string, planHasCover: boolean): number {
  if (preference === 'important') return planHasCover ? 10 : 0
  if (preference === 'somewhat') return planHasCover ? 7 : 3
  if (preference === 'not-important') return 10 // Any plan is fine
  return 0
}

function scorePhysioRehab(preference: string, planHasCover: boolean): number {
  if (preference === 'yes') return planHasCover ? 10 : 0
  if (preference === 'no') return 10 // Any plan is fine
  if (preference === 'not-applicable') return 10 // Any plan is fine
  return 0
}

function scoreMentalHealthSupport(preference: string, planHasCover: boolean): number {
  if (preference === 'yes') return planHasCover ? 10 : 0
  if (preference === 'no') return 10 // Any plan is fine
  if (preference === 'not-applicable') return 10 // Any plan is fine
  return 0
}

// Import query function from db module
import { query } from '@/lib/db'
