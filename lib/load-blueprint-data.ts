/**
 * Load Blueprint Data - Loads all configuration files from the MIT-PE-AIML-TEAM2 blueprint
 * This module fetches and caches all required JSON/MD files for the recommendation engine
 */

import type {
  QuestionBank,
  ScoringSpec,
  BenefitDictionary,
  HealthInsurancePlan,
  SessionAnalyticsSchema,
} from './types'

// Cache for loaded data
let cachedData: {
  questionBank?: QuestionBank
  scoringSpec?: ScoringSpec
  benefitDictionary?: BenefitDictionary
  plans?: HealthInsurancePlan[]
  sessionAnalyticsSchema?: SessionAnalyticsSchema
  complianceStatement?: string
  postSessionStatsPanel?: string
} = {}

/**
 * Load JSON configuration file from public/data directory
 * @param filename - Name of the JSON file to load
 * @returns Parsed JSON data
 */
async function loadJsonFile<T>(filename: string): Promise<T> {
  try {
    const response = await fetch(`/data/${filename}`)
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error loading ${filename}:`, error)
    throw error
  }
}

/**
 * Load Markdown file from public/data directory
 * @param filename - Name of the MD file to load
 * @returns Raw markdown content
 */
async function loadMarkdownFile(filename: string): Promise<string> {
  try {
    const response = await fetch(`/data/${filename}`)
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`)
    }
    return await response.text()
  } catch (error) {
    console.error(`Error loading ${filename}:`, error)
    throw error
  }
}

/**
 * Get question bank configuration
 * Defines all questions, allowed answers, and priority weights
 */
export async function getQuestionBank(): Promise<QuestionBank> {
  if (!cachedData.questionBank) {
    cachedData.questionBank = await loadJsonFile<QuestionBank>('question_bank.json')
  }
  return cachedData.questionBank
}

/**
 * Get scoring specification
 * Defines hard filters, feature scoring, tie-breakers, and explainability settings
 */
export async function getScoringSpec(): Promise<ScoringSpec> {
  if (!cachedData.scoringSpec) {
    cachedData.scoringSpec = await loadJsonFile<ScoringSpec>('scoring_spec.json')
  }
  return cachedData.scoringSpec
}

/**
 * Get benefit dictionary
 * Schema and field definitions for all insurance benefits
 */
export async function getBenefitDictionary(): Promise<BenefitDictionary> {
  if (!cachedData.benefitDictionary) {
    cachedData.benefitDictionary = await loadJsonFile<BenefitDictionary>('benefit_dictionary.json')
  }
  return cachedData.benefitDictionary
}

/**
 * Get all insurance plans (272 plans from 4 insurers)
 * Includes computed fields: null_key_count, completeness_score
 */
export async function getPlans(): Promise<HealthInsurancePlan[]> {
  if (!cachedData.plans) {
    cachedData.plans = await loadJsonFile<HealthInsurancePlan[]>('plans.json')
  }
  return cachedData.plans
}

/**
 * Get session analytics schema
 * Defines what telemetry is allowed to be stored (anonymous, no payload)
 */
export async function getSessionAnalyticsSchema(): Promise<SessionAnalyticsSchema> {
  if (!cachedData.sessionAnalyticsSchema) {
    cachedData.sessionAnalyticsSchema = await loadJsonFile<SessionAnalyticsSchema>(
      'session_analytics_schema.json'
    )
  }
  return cachedData.sessionAnalyticsSchema
}

/**
 * Get compliance statement
 * Privacy and consent gate text (no-storage model)
 */
export async function getComplianceStatement(): Promise<string> {
  if (!cachedData.complianceStatement) {
    cachedData.complianceStatement = await loadMarkdownFile('compliance_statement.md')
  }
  return cachedData.complianceStatement
}

/**
 * Get post-session stats panel template
 * Template for showing aggregated metrics after session completion
 */
export async function getPostSessionStatsPanel(): Promise<string> {
  if (!cachedData.postSessionStatsPanel) {
    cachedData.postSessionStatsPanel = await loadMarkdownFile('post_session_stats_panel.md')
  }
  return cachedData.postSessionStatsPanel
}

/**
 * Load all blueprint data at once
 * Useful for initialization or pre-loading
 */
export async function loadAllBlueprintData() {
  try {
    await Promise.all([
      getQuestionBank(),
      getScoringSpec(),
      getBenefitDictionary(),
      getPlans(),
      getSessionAnalyticsSchema(),
      getComplianceStatement(),
      getPostSessionStatsPanel(),
    ])
    console.log('✅ All blueprint data loaded successfully')
  } catch (error) {
    console.error('❌ Error loading blueprint data:', error)
    throw error
  }
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearCache() {
  cachedData = {}
}
