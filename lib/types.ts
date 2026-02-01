/**
 * Type definitions for Irish Health Insurance Chooser v2.0
 * Includes advanced features from MIT-PE-AIML-TEAM2 blueprint
 */

export interface HealthInsuranceProvider {
  id: string
  name: string
  marketShare: number
  customerBase: string
  founded: number
  logo?: string
  description: string
  website: string
  phone: string
}

export interface HealthInsurancePlan {
  id: string
  providerId: string
  name: string
  tier: 'BASIC' | 'MID' | 'HIGH'
  adultPrice: number
  childPrice: number
  familyPrice: number
  
  // Coverage fields (NULL-safe: null = unknown, not false)
  hospitalCover?: 'PUBLIC' | 'PRIVATE' | 'HI_TECH' | null
  outpatientCover?: boolean | null
  gpVisits?: boolean | null
  maternityIncluded?: boolean | null
  maternityWaitingMonths?: number | null
  mentalHealthCover?: boolean | null
  cardiacCover?: boolean | null
  cancerCover?: boolean | null
  overseasEmergency?: boolean | null
  overseasPlanned?: boolean | null
  semiPrivateRoom?: boolean | null
  privateRoom?: boolean | null
  dayCase?: boolean | null
  
  // Legacy fields for backward compatibility
  coverage?: {
    inpatient: boolean
    dayPatient: boolean
    outpatient: boolean
    gp: boolean
    dental: boolean
    optical: boolean
    mental: boolean
    physiotherapy: boolean
  }
  
  features: string[]
  waitingPeriod: number
  excess: number
  hospitalNetwork: string[]
  description: string
  
  // Data quality fields
  sourceUrl?: string
  lastVerified?: string
  nullKeyCount?: number
  completenessScore?: number
}

export interface UserPreferences {
  // Basic demographics
  adults: number
  children: number
  dependents: number
  
  // Hospital preference
  hospitalLevel?: 'Public only' | 'Private' | 'Hi-Tech'
  
  // Price posture
  pricePosture?: 'Price-sensitive' | 'Balanced' | 'Benefit-maximizing'
  
  // Specific needs
  needsMaternity?: boolean
  needsMentalHealth?: boolean
  needsOverseas?: boolean
  needsCardiac?: boolean
  needsCancer?: boolean
  
  // Legacy fields for backward compatibility
  age?: number
  familySize?: number
  budget?: number
  priorities?: string[]
  hasExistingCover?: boolean
  specificNeeds?: string[]
}

export interface ComparisonResult {
  plan: HealthInsurancePlan
  provider: HealthInsuranceProvider
  matchPercentage: number
  estimatedAnnualCost: number
  reasons: string[]
  completenessScore?: number
  needsVerification?: boolean
  score?: number // Legacy field
}

export interface SessionAnalytics {
  session_id: string
  timestamp_utc: string
  questions_asked: string[]
  answers_summary: Record<string, string>
  answered_count: number
  dropoff_question_id: string | null
  final_plans_presented: string[]
  plan_clicked: string | null
  user_satisfied: boolean | null
  time_to_recommendation_seconds: number
  presented_plan_completeness: Record<string, number>
}
