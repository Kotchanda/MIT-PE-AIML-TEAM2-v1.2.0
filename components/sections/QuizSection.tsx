/**
 * Quiz Section Component - Expanded Adaptive Questionnaire
 * Implements MIT-PE-AIML-TEAM2 v1.2.0 blueprint with 272 insurance plans
 * Uses NULL-safe scoring and tie-breaker logic
 * 
 * ENHANCED: 12 detailed questions covering:
 * - Hospital level preferences (public, semi-private, private, hi-tech)
 * - Day-to-day benefits (GP visits, dentist, physio, optical)
 * - Specialist coverage (outpatient, mental health, maternity)
 * - Specific product features (pre/post-natal, menopause, gender affirmation)
 * - Provider-specific benefits (travel insurance, waiting periods, claims speed)
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { getRecommendationsV3, getPlanStatistics } from '@/lib/recommendation-engine-v3'
import type { UserPreferences, ComparisonResult } from '@/lib/types'

interface QuizSectionProps {
  onComplete: (results: ComparisonResult[], stats: any) => void
}

/**
 * EXPANDED Quiz questions - 12 detailed questions covering product-level features
 * Based on 2024-2025 Irish health insurance market research:
 * - VHI: Broad coverage, established market leader
 * - Laya Healthcare: Assure/Precision suites, competitive pricing
 * - Irish Life Health: Tailored Health Plans, Better Select ILH, Horizon Plans
 * - Level Health: New entrant (Nov 2024), simplified 4-plan model, aggressive pricing
 * 
 * Each question maps to user preferences that drive the recommendation engine
 */
const QUIZ_QUESTIONS = [
  {
    id: 'hospital-level',
    question: 'What level of hospital cover do you prefer?',
    type: 'radio',
    options: [
      { label: 'Public hospitals only (most affordable)', value: 'PUBLIC' },
      { label: 'Semi-private rooms in public hospitals', value: 'SEMI_PRIVATE' },
      { label: 'Private hospitals (choice of consultant)', value: 'PRIVATE' },
      { label: 'High-tech private facilities (advanced diagnostics)', value: 'HI_TECH' },
    ],
    helper: 'This is the most important factor in plan selection. High-tech hospitals offer advanced imaging and procedures.',
  },
  {
    id: 'day-to-day-benefits',
    question: 'How important are day-to-day health benefits?',
    type: 'radio',
    options: [
      { label: 'Essential - I need GP, dentist, physio coverage', value: 'ESSENTIAL' },
      { label: 'Important - I want some day-to-day cover', value: 'IMPORTANT' },
      { label: 'Not needed - Hospital cover is enough', value: 'NOT_NEEDED' },
    ],
    helper: 'Day-to-day benefits include GP visits, dental, physiotherapy, optical, and mental health counseling.',
  },
  {
    id: 'gp-visits',
    question: 'Do you want GP visit coverage?',
    type: 'radio',
    options: [
      { label: 'Yes, I visit my GP regularly (€40-50/visit typical)', value: true },
      { label: 'No, I rarely need GP services', value: false },
    ],
    helper: 'Covers general practitioner consultations. Plans vary: some offer €40/visit, others €50+.',
  },
  {
    id: 'dental-optical',
    question: 'Do you need dental and optical coverage?',
    type: 'radio',
    options: [
      { label: 'Yes, both dental and optical are important', value: 'BOTH' },
      { label: 'Dental only', value: 'DENTAL' },
      { label: 'Optical only', value: 'OPTICAL' },
      { label: 'No, not needed', value: 'NONE' },
    ],
    helper: 'Dental: cleanings, fillings, extractions. Optical: eye tests, glasses, contact lenses.',
  },
  {
    id: 'physiotherapy',
    question: 'Is physiotherapy coverage important?',
    type: 'radio',
    options: [
      { label: 'Yes, I need regular physio (€50-70/session typical)', value: true },
      { label: 'No, not a priority', value: false },
    ],
    helper: 'Covers rehabilitation, sports injuries, and musculoskeletal treatment.',
  },
  {
    id: 'maternity',
    question: 'Do you need maternity cover?',
    type: 'radio',
    options: [
      { label: 'Yes, maternity cover is essential', value: true },
      { label: 'No, not applicable to me', value: false },
    ],
    helper: 'Includes pregnancy, delivery, and postnatal care. Irish Life Health offers €600 pre/post-natal on Better Select ILH.',
  },
  {
    id: 'maternity-extras',
    question: 'If maternity is needed, do you want enhanced benefits?',
    type: 'radio',
    options: [
      { label: 'Yes, pre/post-natal care, menopause, gender affirmation benefits', value: 'ENHANCED' },
      { label: 'Basic maternity only', value: 'BASIC' },
      { label: 'Not applicable', value: 'NOT_APPLICABLE' },
    ],
    helper: 'Enhanced: €600 pre/post-natal (Irish Life), €250 menopause benefit, up to €100k gender affirmation (Better Select ILH).',
  },
  {
    id: 'mental-health',
    question: 'Is mental health coverage important?',
    type: 'radio',
    options: [
      { label: 'Yes, mental health support is important', value: true },
      { label: 'No, not a priority for me', value: false },
    ],
    helper: 'Covers counseling, therapy, and psychiatric services. Many plans include this.',
  },
  {
    id: 'outpatient-specialists',
    question: 'Do you need outpatient specialist coverage?',
    type: 'radio',
    options: [
      { label: 'Yes, specialist consultations are important (€75-100/visit typical)', value: true },
      { label: 'No, not needed', value: false },
    ],
    helper: 'Covers visits to specialists (cardiologist, dermatologist, etc.) outside hospitals.',
  },
  {
    id: 'consultant-choice',
    question: 'How important is choice of consultant?',
    type: 'radio',
    options: [
      { label: 'Very important - I want to choose my consultant', value: 'IMPORTANT' },
      { label: 'Somewhat important - Limited choice is acceptable', value: 'SOMEWHAT' },
      { label: 'Not important - Any qualified consultant is fine', value: 'NOT_IMPORTANT' },
    ],
    helper: 'Private/hi-tech plans offer consultant choice. Public plans may have limited options.',
  },
  {
    id: 'travel-insurance',
    question: 'Do you need travel/overseas emergency coverage?',
    type: 'radio',
    options: [
      { label: 'Yes, I travel frequently and need coverage', value: true },
      { label: 'No, not necessary', value: false },
    ],
    helper: 'Emergency medical coverage while traveling abroad. Level Health includes free worldwide travel insurance.',
  },
  {
    id: 'budget-priority',
    question: 'What is your primary budget consideration?',
    type: 'radio',
    options: [
      { label: 'Lowest cost - I want the most affordable option', value: 'LOWEST' },
      { label: 'Best value - Good coverage at reasonable price', value: 'VALUE' },
      { label: 'Premium coverage - Cost is less important than benefits', value: 'PREMIUM' },
    ],
    helper: 'Level Health offers aggressive pricing (€45-248/month). Irish Life Health and Laya offer broader coverage.',
  },
]

export function QuizSection({ onComplete }: QuizSectionProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const question = QUIZ_QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100

  /**
   * Handle answer selection
   * Updates the answers state with the selected value
   * Supports both radio (single) and checkbox (multiple) selections
   */
  const handleAnswer = (value: any) => {
    setAnswers({
      ...answers,
      [question.id]: value,
    })
  }

  /**
   * Move to next question
   * Validates that current question is answered before proceeding
   */
  const handleNext = () => {
    if (answers[question.id] === undefined) {
      setError('Please select an answer before continuing')
      return
    }
    setError(null)

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  /**
   * Move to previous question
   */
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setError(null)
    }
  }

  /**
   * Submit quiz and get recommendations
   * Converts quiz answers to UserPreferences format
   * Calls recommendation engine v3 with 272 plans
   * 
   * Logic:
   * 1. Validate final answer
   * 2. Convert answers to UserPreferences object
   * 3. Call getRecommendationsV3() to score all 272 plans
   * 4. Get plan statistics for post-session panel
   * 5. Call parent component with results
   */
  const handleSubmit = async () => {
    if (answers[question.id] === undefined) {
      setError('Please select an answer before submitting')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Convert quiz answers to UserPreferences format
      // This maps the detailed quiz answers to the scoring engine's preference model
      const preferences: UserPreferences = {
        hospitalLevel: answers['hospital-level'],
        outpatientCover: answers['outpatient-specialists'],
        gpVisits: answers['gp-visits'],
        maternityNeeded: answers['maternity'],
        mentalHealthCover: answers['mental-health'],
        overseasCoverage: answers['travel-insurance'],
        // Additional preferences from expanded questionnaire
        dayToDayBenefits: answers['day-to-day-benefits'],
        dentalOptical: answers['dental-optical'],
        physiotherapy: answers['physiotherapy'],
        maternityExtras: answers['maternity-extras'],
        consultantChoice: answers['consultant-choice'],
        budgetPriority: answers['budget-priority'],
      }

      console.log('📋 Quiz answers (12 questions):', answers)
      console.log('🎯 User preferences:', preferences)

      // Get recommendations from engine v3 (processes 272 plans)
      // Scoring logic:
      // - Hospital: 40 points
      // - Outpatient: 25 points
      // - GP Visits: 15 points
      // - Maternity: 15 points
      // - Mental Health: 15 points
      // - Overseas: 10 points
      // - Day-to-day: 10 points
      // - Dental/Optical: 10 points
      // - Physio: 10 points
      // - Consultant Choice: 5 points
      // - Travel Insurance: 5 points
      // - Budget: 5 points
      // Total: 165 points possible
      const results = await getRecommendationsV3(preferences)
      console.log('✅ Recommendations generated:', results.length)

      // Get plan statistics for post-session panel
      // Used to show historical optimization data
      const stats = await getPlanStatistics()
      console.log('📊 Plan statistics:', stats)

      // Call parent component with results
      onComplete(results, stats)
    } catch (err) {
      console.error('❌ Error generating recommendations:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate recommendations. Please try again.'
      )
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
          </span>
          <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question card */}
      <Card className="p-8 mb-8">
        {/* Question title */}
        <h2 className="text-2xl font-semibold mb-2">{question.question}</h2>

        {/* Helper text - provides context about the question */}
        {question.helper && (
          <p className="text-sm text-muted-foreground mb-6">{question.helper}</p>
        )}

        {/* Answer options */}
        <div className="space-y-4 mb-8">
          {question.type === 'radio' ? (
            <RadioGroup value={answers[question.id]?.toString() || ''} onValueChange={handleAnswer}>
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={option.value.toString()}
                    id={`option-${option.value}`}
                  />
                  <Label
                    htmlFor={`option-${option.value}`}
                    className="text-base font-normal cursor-pointer flex-1"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}</RadioGroup>
          ) : (
            <div className="space-y-3">
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`option-${option.value}`}
                    checked={answers[question.id]?.includes(option.value) || false}
                    onCheckedChange={(checked) => {
                      const current = answers[question.id] || []
                      if (checked) {
                        handleAnswer([...current, option.value])
                      } else {
                        handleAnswer(current.filter((v: any) => v !== option.value))
                      }
                    }}
                  />
                  <Label
                    htmlFor={`option-${option.value}`}
                    className="text-base font-normal cursor-pointer flex-1"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}</div>
          )}
        </div>

        {/* Error message */}
        {error && <div className="text-sm text-destructive mb-6 p-3 bg-destructive/10 rounded">{error}</div>}
      </Card>

      {/* Navigation buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0 || loading}
          className="flex-1"
        >
          ← Previous
        </Button>

        {currentQuestion === QUIZ_QUESTIONS.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={loading || answers[question.id] === undefined}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Analyzing 272 plans...' : 'Get Recommendations ✓'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={loading || answers[question.id] === undefined}
            className="flex-1"
          >
            Next →
          </Button>
        )}</div>

      {/* Loading indicator */}
      {loading && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            <div>
              <p className="font-medium text-blue-900">Processing your preferences...</p>
              <p className="text-sm text-blue-700">Analyzing 272 insurance plans with NULL-safe scoring and tie-breaker logic</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
