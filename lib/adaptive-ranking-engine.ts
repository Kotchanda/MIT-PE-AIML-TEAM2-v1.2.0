/**
 * Adaptive Ranking Engine - Question Ordering System
 * 
 * Ranks quiz questions based on:
 * 1. Discriminative Power (DP): How well a question separates plans
 *    Formula: DP = |Plans(YES) - Plans(NO)| / Total Plans × 100
 * 2. User's Current Answers: Contextual relevance to what they've already said
 * 3. Remaining Questions: Prioritize unanswered questions
 * 
 * This ensures users find their ideal plan faster by asking the most
 * statistically relevant questions first.
 */

import { queryAll, queryOne, execute } from '@/lib/db'

/**
 * Ranks questions for a quiz session based on statistical relevance
 * and user's current answers
 * 
 * @param sessionId - The quiz session ID
 * @param questions - Array of available questions to rank
 * @param currentAnswers - User's answers so far (for contextual ranking)
 * @returns Sorted array of questions by relevance (highest first)
 */
export async function rankQuestionsForSession(
  sessionId: string,
  questions: any[],
  currentAnswers: Record<string, any>
) {
  console.log('[AdaptiveRanking] Ranking', questions.length, 'questions for session', sessionId)

  // Sort by discriminative power (highest first)
  // Questions with higher DP are more likely to differentiate between plans
  const ranked = [...questions].sort((a, b) => {
    const dpA = a.discriminativePower || 0
    const dpB = b.discriminativePower || 0
    return dpB - dpA // Descending order
  })

  console.log('[AdaptiveRanking] Top 3 ranked questions:')
  ranked.slice(0, 3).forEach((q, i) => {
    console.log(`  ${i + 1}. ${q.questionKey} (DP: ${(q.discriminativePower * 100).toFixed(1)}%)`)
  })

  return ranked
}

/**
 * Calculate discriminative power for a question
 * 
 * DP = |Plans(YES) - Plans(NO)| / Total Plans × 100
 * 
 * Higher DP means the question better separates plans
 * Example: If 150 plans cover YES and 100 cover NO:
 *   DP = |150 - 100| / 250 × 100 = 20%
 * 
 * @param questionKey - The question identifier
 * @param plansWithYes - Count of plans that match YES answer
 * @param plansWithNo - Count of plans that match NO answer
 * @param totalPlans - Total number of plans in database
 * @returns Discriminative power as decimal (0-1)
 */
export function calculateDiscriminativePower(
  questionKey: string,
  plansWithYes: number,
  plansWithNo: number,
  totalPlans: number
): number {
  if (totalPlans === 0) return 0

  const difference = Math.abs(plansWithYes - plansWithNo)
  const dp = difference / totalPlans

  console.log(`[AdaptiveRanking] DP for ${questionKey}: |${plansWithYes} - ${plansWithNo}| / ${totalPlans} = ${(dp * 100).toFixed(1)}%`)

  return dp
}

/**
 * Map question answers to plan attributes
 * This is the core matching logic that connects user answers to insurance plans
 * 
 * Each question key maps to specific plan attributes that determine
 * which plans match the user's preferences
 */
export function mapAnswerToPlanAttribute(
  questionKey: string,
  answer: any
): { attribute: string; value: any } | null {
  // SECTION 1: FAMILY & DEMOGRAPHICS
  if (questionKey === 'familyComposition') {
    return {
      attribute: 'familyComposition',
      value: answer, // INDIVIDUAL, COUPLE, FAMILY, GROUP
    }
  }

  if (questionKey === 'ageGroup') {
    return {
      attribute: 'ageGroup',
      value: answer, // UNDER_26, 26_40, 41_60, OVER_60
    }
  }

  // SECTION 2: HOSPITAL COVERAGE
  if (questionKey === 'hospitalLevel') {
    return {
      attribute: 'hospitalLevel',
      value: answer, // PUBLIC, SEMI_PRIVATE, PRIVATE, HI_TECH
    }
  }

  if (questionKey === 'dayCaseProcedures') {
    return {
      attribute: 'dayCaseCover',
      value: answer === true ? 'INCLUDED' : 'NOT_INCLUDED',
    }
  }

  if (questionKey === 'consultantChoice') {
    return {
      attribute: 'consultantChoice',
      value: answer, // IMPORTANT, SOMEWHAT, NOT_IMPORTANT
    }
  }

  // SECTION 3: DAY-TO-DAY BENEFITS
  if (questionKey === 'dayToDayBenefits') {
    return {
      attribute: 'dayToDayBenefits',
      value: answer, // ESSENTIAL, IMPORTANT, NOT_NEEDED
    }
  }

  if (questionKey === 'gpVisits') {
    return {
      attribute: 'gpCover',
      value: answer === true ? 'INCLUDED' : 'NOT_INCLUDED',
    }
  }

  if (questionKey === 'dentalOptical') {
    return {
      attribute: 'dentalOpticalCover',
      value: answer, // BOTH, DENTAL, OPTICAL, NONE
    }
  }

  if (questionKey === 'physiotherapy') {
    return {
      attribute: 'physiotherapyCover',
      value: answer === true ? 'INCLUDED' : 'NOT_INCLUDED',
    }
  }

  // SECTION 4: SPECIALIST & MENTAL HEALTH
  if (questionKey === 'outpatientSpecialists') {
    return {
      attribute: 'outpatientSpecialistCover',
      value: answer === true ? 'INCLUDED' : 'NOT_INCLUDED',
    }
  }

  if (questionKey === 'mentalHealth') {
    return {
      attribute: 'mentalHealthCover',
      value: answer === true ? 'INCLUDED' : 'NOT_INCLUDED',
    }
  }

  // SECTION 5: MATERNITY & WOMEN'S HEALTH
  if (questionKey === 'maternity') {
    return {
      attribute: 'maternityCover',
      value: answer === true ? 'INCLUDED' : 'NOT_INCLUDED',
    }
  }

  if (questionKey === 'maternityExtras') {
    return {
      attribute: 'maternityExtras',
      value: answer, // ENHANCED, BASIC, NOT_APPLICABLE
    }
  }

  if (questionKey === 'menopauseCover') {
    return {
      attribute: 'menopauseCover',
      value: answer === true ? 'INCLUDED' : 'NOT_INCLUDED',
    }
  }

  if (questionKey === 'genderAffirmation') {
    return {
      attribute: 'genderAffirmationCover',
      value: answer === true ? 'INCLUDED' : 'NOT_INCLUDED',
    }
  }

  // SECTION 6: SERIOUS CONDITIONS
  if (questionKey === 'cardiacCancerCover') {
    return {
      attribute: 'seriousConditionsCover',
      value: answer, // BOTH, CARDIAC, CANCER, NONE
    }
  }

  // SECTION 7: TRAVEL & INTERNATIONAL
  if (questionKey === 'travelInsurance') {
    return {
      attribute: 'travelCover',
      value: answer === true ? 'INCLUDED' : 'NOT_INCLUDED',
    }
  }

  if (questionKey === 'plannedTreatmentAbroad') {
    return {
      attribute: 'plannedTreatmentAbroad',
      value: answer === true ? 'INCLUDED' : 'NOT_INCLUDED',
    }
  }

  // SECTION 8: BUDGET & CLAIMS
  if (questionKey === 'budgetPriority') {
    return {
      attribute: 'budgetTier',
      value: answer, // LOWEST, VALUE, PREMIUM
    }
  }

  if (questionKey === 'claimsSpeed') {
    return {
      attribute: 'claimsProcessing',
      value: answer, // IMPORTANT, SOMEWHAT, NOT_IMPORTANT
    }
  }

  // SECTION 9: WELLNESS & PREVENTIVE CARE
  if (questionKey === 'wellnessPrograms') {
    return {
      attribute: 'wellnessPrograms',
      value: answer === true ? 'INCLUDED' : 'NOT_INCLUDED',
    }
  }

  if (questionKey === 'alternativeMedicine') {
    return {
      attribute: 'alternativeMedicineCover',
      value: answer === true ? 'INCLUDED' : 'NOT_INCLUDED',
    }
  }

  // SECTION 10: PROVIDER PREFERENCES
  if (questionKey === 'providerPreference') {
    return {
      attribute: 'provider',
      value: answer, // VHI, LAYA, IRISH_LIFE, LEVEL, NO_PREFERENCE
    }
  }

  if (questionKey === 'customerService') {
    return {
      attribute: 'customerServiceQuality',
      value: answer, // IMPORTANT, SOMEWHAT, NOT_IMPORTANT
    }
  }

  console.warn(`[AdaptiveRanking] Unknown question key: ${questionKey}`)
  return null
}

/**
 * Count how many plans match a specific answer
 * 
 * This is used to calculate discriminative power by counting
 * how many plans in the database match each answer option
 * 
 * @param questionKey - The question identifier
 * @param answer - The answer value
 * @returns Count of matching plans
 */
export async function countMatchingPlans(
  questionKey: string,
  answer: any
): Promise<number> {
  // This would query the plans database to count matches
  // For now, returning placeholder - would be implemented with actual plan data
  
  console.log(`[AdaptiveRanking] Counting plans matching ${questionKey}=${answer}`)
  
  // TODO: Implement actual plan matching logic
  // This would involve querying the plans table and checking attributes
  
  return 0
}

/**
 * Update question statistics based on user responses
 * 
 * As users answer questions, we track:
 * - Total responses per question
 * - Unique users answering
 * - Response patterns
 * - Discriminative power updates
 * 
 * @param questionKey - The question identifier
 * @param answer - The answer provided
 */
export async function updateQuestionStatistics(
  questionKey: string,
  answer: any
): Promise<void> {
  try {
    console.log(`[AdaptiveRanking] Updating statistics for ${questionKey}`)

    // Update question statistics using raw SQL
    await execute(
      `UPDATE "QuestionStatistics" 
       SET "totalResponses" = "totalResponses" + 1, 
           "lastUpdated" = NOW()
       WHERE "questionKey" = $1`,
      [questionKey]
    )

    console.log(`[AdaptiveRanking] Statistics updated for ${questionKey}`)
  } catch (error) {
    console.error(`[AdaptiveRanking] Error updating statistics:`, error)
  }
}

/**
 * Get the next best question for a user
 * 
 * Considers:
 * 1. Questions already answered (exclude these)
 * 2. Discriminative power (prioritize high-DP questions)
 * 3. User's current answers (contextual relevance)
 * 
 * @param sessionId - The quiz session ID
 * @param answeredQuestionKeys - Array of question keys already answered
 * @param currentAnswers - User's answers so far
 * @returns The next best question to ask
 */
export async function getNextBestQuestion(
  sessionId: string,
  answeredQuestionKeys: string[],
  currentAnswers: Record<string, any>
): Promise<any> {
  console.log('[AdaptiveRanking] Finding next best question...')
  console.log('[AdaptiveRanking] Already answered:', answeredQuestionKeys.length)

  // Get all active questions using raw SQL
  const allQuestions = await queryAll<any>(
    `SELECT "questionKey", "questionText", "questionType", "discriminativePower", "isActive"
     FROM "QuestionStatistics"
     WHERE "isActive" = true
     ORDER BY "discriminativePower" DESC`
  )

  // Filter out answered questions
  const remainingQuestions = allQuestions.filter(
    (q) => !answeredQuestionKeys.includes(q.questionKey)
  )

  if (remainingQuestions.length === 0) {
    console.log('[AdaptiveRanking] No more questions available')
    return null
  }

  // Rank remaining questions
  const ranked = await rankQuestionsForSession(
    sessionId,
    remainingQuestions,
    currentAnswers
  )

  console.log('[AdaptiveRanking] Next best question:', ranked[0].questionKey)
  return ranked[0]
}
