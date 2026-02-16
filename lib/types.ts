/**
 * TypeScript Types - Irish Health Insurance Chooser v3.0
 * Comprehensive types for 272-plan dataset with blueprint compliance
 * 
 * EXPANDED: Includes new preference fields from 12-question questionnaire
 * - Day-to-day benefits (GP, dental, optical, physio)
 * - Maternity extras (pre/post-natal, menopause, gender affirmation)
 * - Consultant choice preference
 * - Budget priority
 */

// ============================================================================
// USER PREFERENCES & QUIZ RESPONSES
// ============================================================================

export interface UserPreferences {
  // Family composition
  adults?: number
  children?: number
  dependents?: number

  // Hospital preference (Question 1)
  hospitalLevel?: 'PUBLIC' | 'SEMI_PRIVATE' | 'PRIVATE' | 'HI_TECH'

  // Day-to-day benefits importance (Question 2)
  dayToDayBenefits?: 'ESSENTIAL' | 'IMPORTANT' | 'NOT_NEEDED'

  // Coverage preferences (Questions 3-5)
  gpVisits?: boolean
  dentalOptical?: 'BOTH' | 'DENTAL' | 'OPTICAL' | 'NONE'
  physiotherapy?: boolean

  // Maternity coverage (Questions 6-7)
  maternityNeeded?: boolean
  maternityExtras?: 'ENHANCED' | 'BASIC' | 'NOT_APPLICABLE'

  // Mental health (Question 8)
  mentalHealthCover?: boolean

  // Outpatient specialists (Question 9)
  outpatientCover?: boolean

  // Consultant choice (Question 10)
  consultantChoice?: 'IMPORTANT' | 'SOMEWHAT' | 'NOT_IMPORTANT'

  // Travel insurance (Question 11)
  overseasCoverage?: boolean

  // Budget priority (Question 12)
  budgetPriority?: 'LOWEST' | 'VALUE' | 'PREMIUM'

  // Legacy preferences (for backward compatibility)
  priceSensitivity?: 'BUDGET' | 'BALANCED' | 'PREMIUM'
  dayCase?: boolean
  cardiacCover?: boolean
  cancerCover?: boolean
}

// ============================================================================
// INSURANCE PLANS (272 plans from blueprint)
// ============================================================================

export interface HealthInsurancePlan {
  // Identifiers
  plan_id: string
  insurer: string
  plan_name: string

  // Tier classification
  plan_tier: 'BASIC' | 'MID' | 'HIGH' | 'PREMIUM'

  // Hospital coverage (Question 1)
  hospital_cover?: 'PUBLIC' | 'SEMI_PRIVATE' | 'PRIVATE' | 'HI_TECH' | null
  semi_private_room?: boolean | null
  private_room?: boolean | null
  day_case?: boolean | null

  // Day-to-day benefits (Questions 2-5)
  gp_visits?: boolean | null
  gp_visit_cost?: number | null // €/visit
  dental_cover?: boolean | null
  optical_cover?: boolean | null
  physiotherapy?: boolean | null
  physio_cost?: number | null // €/session

  // Specialist coverage (Question 9)
  outpatient_cover?: boolean | null
  specialist_visit_cost?: number | null // €/visit

  // Maternity coverage (Questions 6-7)
  maternity_cover?: boolean | null
  maternity_waiting_months?: number | null
  prenatal_postnatal_benefit?: number | null // € amount
  menopause_benefit?: number | null // € amount
  gender_affirmation_cover?: number | null // € amount (up to)

  // Mental health (Question 8)
  mental_health?: boolean | null

  // Consultant choice (Question 10)
  consultant_choice?: boolean | null

  // Travel insurance (Question 11)
  overseas_emergency?: boolean | null
  overseas_planned?: boolean | null
  travel_insurance_included?: boolean | null

  // Additional coverage
  cardiac_cover?: boolean | null
  cancer_cover?: boolean | null

  // Pricing
  excess_required?: boolean | null
  excess_amount_text?: string | null
  estimated_annual_cost?: number | null

  // Metadata
  regulatory_notes?: string
  source_url?: string
  last_verified?: string

  // Completeness metrics (computed)
  null_key_count?: number
  completeness_score?: number
}

// ============================================================================
// RECOMMENDATION RESULTS
// ============================================================================

export interface ComparisonResult {
  plan: HealthInsurancePlan
  provider: HealthInsuranceProvider
  score: number // 0-100 relative score
  matchPercentage: number
  reasons: string[] // Explainable reasons why this plan matches
  drivers: Array<{
    feature: string
    points: number
  }>
  tradeOffs?: string
  verificationNeeded: boolean
  verificationFlags: string[]
  sourceUrl?: string
  completenessScore: number
  estimatedAnnualCost: number
}

// ============================================================================
// BLUEPRINT CONFIGURATION FILES
// ============================================================================

export interface Question {
  id: string
  text: string
  helper_text?: string
  answers: Array<{
    id: string
    text: string
    mapped_field?: string
    mapped_value?: any
  }>
  priority_weight: number
  elimination_rules?: Array<{
    field: string
    value: any
    action: 'eliminate' | 'boost'
  }>
}

export interface QuestionBank {
  version: string
  questions: Question[]
  max_questions: number
  stopping_conditions: {
    min_remaining_plans: number
    strong_score_separation: number
  }
}

export interface ScoringSpec {
  version: string
  hard_filters: Array<{
    field: string
    must_have_value?: any
    eliminate_if_value?: any
  }>
  feature_scoring: Record<string, Record<string, number>>
  tier_multipliers: Record<string, number>
  tie_breaker_rules: string[]
  explainability_settings: {
    show_top_drivers: number
    show_trade_offs: boolean
    show_verification_flags: boolean
  }
}

export interface BenefitDictionary {
  version: string
  schema: Record<
    string,
    {
      type: string
      description: string
      null_means: string
      key_field: boolean
    }
  >
}

export interface SessionAnalyticsSchema {
  version: string
  allowed_fields: string[]
  no_storage_fields: string[]
  anonymous_only: boolean
}

// ============================================================================
// SESSION & ANALYTICS
// ============================================================================

export interface SessionData {
  session_id: string
  consent_accepted: boolean
  questions_asked: string[]
  answers: Record<string, any>
  plans_presented: string[]
  plan_clicked?: string
  satisfaction?: boolean
  time_to_recommendation: number
  completeness_scores?: number[]
}

export interface PostSessionStats {
  plan_count: number
  avg_completeness: number
  top_questions: Array<{
    question_id: string
    question_text: string
    info_gain: number
  }>
  bottom_questions: Array<{
    question_id: string
    question_text: string
    info_gain: number
  }>
  deltas_since_last_release: Array<{
    question_id: string
    moved_up_or_down: number
  }>
}

// ============================================================================
// PROVIDER INFORMATION
// ============================================================================

export interface HealthInsuranceProvider {
  id: string
  name: string
  marketShare: number
  customerBase: string
  founded: number
  description: string
  website: string
  phone: string
}
