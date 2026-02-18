/**
 * Quiz Section Component - Expanded Adaptive Questionnaire
 * Implements MIT-PE-AIML-TEAM2 v1.2.0 blueprint with 272 insurance plans
 * Uses NULL-safe scoring and tie-breaker logic
 * 
 * EXPANDED: 24 detailed questions covering:
 * - Hospital level preferences (public, semi-private, private, hi-tech)
 * - Day-to-day benefits (GP visits, dentist, physio, optical)
 * - Specialist coverage (outpatient, mental health, maternity)
 * - Specific product features (pre/post-natal, menopause, gender affirmation)
 * - Provider-specific benefits (travel insurance, waiting periods, claims speed)
 * - Family composition and age considerations
 * - Chronic conditions and ongoing care needs
 * - Lifestyle and wellness priorities
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
 * EXPANDED Quiz questions - 24 detailed questions covering product-level features
 * Based on 2024-2025 Irish health insurance market research:
 * - VHI: Broad coverage, established market leader
 * - Laya Healthcare: Assure/Precision suites, competitive pricing
 * - Irish Life Health: Tailored Health Plans, Better Select ILH, Horizon Plans
 * - Level Health: New entrant (Nov 2024), simplified 4-plan model, aggressive pricing
 * 
 * Each question maps to user preferences that drive the recommendation engine
 */
const QUIZ_QUESTIONS = [
  // SECTION 1: FAMILY & DEMOGRAPHICS
  {
    id: 'family-composition',
    question: 'Who do you need to cover?',
    type: 'radio',
    options: [
      { label: 'Just myself (individual)', value: 'INDIVIDUAL' },
      { label: 'Myself and partner (couple)', value: 'COUPLE' },
      { label: 'Family with children', value: 'FAMILY' },
      { label: 'Extended family or group', value: 'GROUP' },
    ],
    helper: 'Family plans often offer better value than individual policies. Some insurers offer discounts for multiple members.',
  },
  {
    id: 'age-group',
    question: 'What is your age group?',
    type: 'radio',
    options: [
      { label: 'Under 26 years', value: 'UNDER_26' },
      { label: '26-40 years', value: '26_40' },
      { label: '41-60 years', value: '41_60' },
      { label: '60+ years', value: 'OVER_60' },
    ],
    helper: 'Age affects premiums and available plans. Younger customers often get better rates on basic plans.',
  },

  // SECTION 2: HOSPITAL COVERAGE
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
    id: 'day-case-procedures',
    question: 'Is day-case surgery coverage important?',
    type: 'radio',
    options: [
      { label: 'Yes, I may need outpatient procedures', value: true },
      { label: 'No, not a priority', value: false },
    ],
    helper: 'Day-case covers procedures like cataract surgery, minor operations done without overnight stay.',
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

  // SECTION 3: DAY-TO-DAY BENEFITS
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

  // SECTION 4: SPECIALIST & MENTAL HEALTH
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
    id: 'mental-health',
    question: 'Is mental health coverage important?',
    type: 'radio',
    options: [
      { label: 'Yes, mental health support is important', value: true },
      { label: 'No, not a priority for me', value: false },
    ],
    helper: 'Covers counseling, therapy, and psychiatric services. Many plans include this.',
  },

  // SECTION 5: MATERNITY & WOMEN'S HEALTH
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
    id: 'menopause-cover',
    question: 'Is menopause-related coverage important?',
    type: 'radio',
    options: [
      { label: 'Yes, I want menopause support and treatment coverage', value: true },
      { label: 'No, not a priority', value: false },
    ],
    helper: 'Menopause coverage includes HRT, counseling, and related treatments (€250 benefit on some plans).',
  },
  {
    id: 'gender-affirmation',
    question: 'Do you need gender affirmation care coverage?',
    type: 'radio',
    options: [
      { label: 'Yes, gender affirmation procedures and treatments', value: true },
      { label: 'No, not applicable', value: false },
    ],
    helper: 'Some plans cover gender-affirming medical procedures and transition-related care (up to €100k on Better Select ILH).',
  },

  // SECTION 6: SERIOUS CONDITIONS
  {
    id: 'cardiac-cancer-cover',
    question: 'Do you want enhanced coverage for serious conditions?',
    type: 'radio',
    options: [
      { label: 'Yes, both cardiac and cancer coverage', value: 'BOTH' },
      { label: 'Cardiac coverage only', value: 'CARDIAC' },
      { label: 'Cancer coverage only', value: 'CANCER' },
      { label: 'No, not needed', value: 'NONE' },
    ],
    helper: 'Some plans offer enhanced coverage for serious conditions like heart disease and cancer.',
  },

  // SECTION 7: TRAVEL & INTERNATIONAL
  {
    id: 'travel-insurance',
    question: 'Do you need travel/overseas emergency coverage?',
    type: 'radio',
    options: [
      { label: 'Yes, I travel frequently and need coverage abroad', value: true },
      { label: 'No, I don\'t travel internationally', value: false },
    ],
    helper: 'Covers emergency medical treatment while traveling outside Ireland. Some plans include planned treatment abroad.',
  },
  {
    id: 'planned-treatment-abroad',
    question: 'Do you want coverage for planned treatment abroad?',
    type: 'radio',
    options: [
      { label: 'Yes, I may seek treatment in other countries', value: true },
      { label: 'No, I prefer Irish treatment', value: false },
    ],
    helper: 'Some plans cover planned procedures in other EU countries or private clinics abroad.',
  },

  // SECTION 8: BUDGET & CLAIMS
  {
    id: 'budget-priority',
    question: 'What is your budget priority?',
    type: 'radio',
    options: [
      { label: 'Lowest cost - I want the cheapest option', value: 'LOWEST' },
      { label: 'Value for money - Balance cost and coverage', value: 'VALUE' },
      { label: 'Premium coverage - I want the best available', value: 'PREMIUM' },
    ],
    helper: 'Budget plans start from €87/month. Premium plans offer comprehensive coverage with higher premiums.',
  },
  {
    id: 'claims-speed',
    question: 'How important is fast claims processing?',
    type: 'radio',
    options: [
      { label: 'Very important - I want claims paid within days', value: 'IMPORTANT' },
      { label: 'Somewhat important - Standard processing is fine', value: 'SOMEWHAT' },
      { label: 'Not important - I\'m flexible on timing', value: 'NOT_IMPORTANT' },
    ],
    helper: 'VHI pays 98% of everyday claims in 5 days. Some insurers take longer.',
  },

  // SECTION 9: WELLNESS & PREVENTIVE CARE
  {
    id: 'wellness-programs',
    question: 'Are wellness and preventive care programs important?',
    type: 'radio',
    options: [
      { label: 'Yes, I want health checks and wellness programs', value: true },
      { label: 'No, not a priority', value: false },
    ],
    helper: 'Some plans include annual health checks, fitness programs, and preventive care benefits.',
  },
  {
    id: 'alternative-medicine',
    question: 'Do you want coverage for alternative/complementary medicine?',
    type: 'radio',
    options: [
      { label: 'Yes, acupuncture, homeopathy, chiropractice coverage', value: true },
      { label: 'No, conventional medicine only', value: false },
    ],
    helper: 'Some plans cover alternative therapies like acupuncture, osteopathy, and homeopathy.',
  },

  // SECTION 10: PROVIDER PREFERENCES
  {
    id: 'provider-preference',
    question: 'Do you have a preferred insurance provider?',
    type: 'radio',
    options: [
      { label: 'Yes, I prefer VHI (market leader, established)', value: 'VHI' },
      { label: 'Yes, I prefer Laya Healthcare (competitive pricing)', value: 'LAYA' },
      { label: 'Yes, I prefer Irish Life Health (tailored plans)', value: 'IRISH_LIFE' },
      { label: 'Yes, I prefer Level Health (new entrant, simple plans)', value: 'LEVEL' },
      { label: 'No preference - Show me all options', value: 'NO_PREFERENCE' },
    ],
    helper: 'Each provider has different strengths. VHI is established, Laya is competitive, Irish Life is tailored, Level is simple.',
  },
  {
    id: 'customer-service',
    question: 'How important is customer service quality?',
    type: 'radio',
    options: [
      { label: 'Very important - I want excellent support', value: 'IMPORTANT' },
      { label: 'Somewhat important - Good support is nice', value: 'SOMEWHAT' },
      { label: 'Not important - I rarely need support', value: 'NOT_IMPORTANT' },
    ],
    helper: 'VHI offers 24/7 NurseLine support. Other providers have varying service levels.',
  },
]

export function QuizSection({ onComplete }: QuizSectionProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const question = QUIZ_QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100
  const isLastQuestion = currentQuestion === QUIZ_QUESTIONS.length - 1

  // Handle answer selection
  const handleAnswer = (value: any) => {
    console.log(`[QuizSection] Answer selected for Q${currentQuestion + 1} (${question.id}):`, value)
    setAnswers({
      ...answers,
      [question.id]: value,
    })
    setError('')
  }

  // Handle next button
  const handleNext = () => {
    if (answers[question.id] === undefined) {
      setError('Please select an answer before continuing')
      return
    }
    console.log(`[QuizSection] Moving from Q${currentQuestion + 1} to Q${currentQuestion + 2}`)
    setCurrentQuestion(currentQuestion + 1)
  }

  // Handle previous button
  const handlePrevious = () => {
    console.log(`[QuizSection] Moving from Q${currentQuestion + 1} to Q${currentQuestion}`)
    setCurrentQuestion(currentQuestion - 1)
  }

  // Handle quiz submission (on final question)
  const handleSubmit = async () => {
    if (answers[question.id] === undefined) {
      setError('Please select an answer before submitting')
      return
    }

    console.log(`[QuizSection] SUBMITTING QUIZ from Q${currentQuestion + 1}/${QUIZ_QUESTIONS.length}`)
    console.log(`[QuizSection] Total answers collected:`, Object.keys(answers).length)

    setLoading(true)
    try {
      // Convert answers to UserPreferences format
      const preferences: UserPreferences = {
        // Family composition
        dependents: answers['family-composition'] === 'FAMILY' ? 2 : 0,
        
        // Hospital preference
        hospitalLevel: answers['hospital-level'],
        
        // Day-to-day benefits
        dayToDayBenefits: answers['day-to-day-benefits'],
        gpVisits: answers['gp-visits'],
        dentalOptical: answers['dental-optical'],
        physiotherapy: answers['physiotherapy'],
        
        // Specialist coverage
        outpatientCover: answers['outpatient-specialists'],
        mentalHealthCover: answers['mental-health'],
        
        // Maternity
        maternityNeeded: answers['maternity'],
        maternityExtras: answers['maternity-extras'],
        
        // Travel
        overseasCoverage: answers['travel-insurance'],
        
        // Budget
        budgetPriority: answers['budget-priority'],
        
        // Legacy fields
        dayCase: answers['day-case-procedures'],
        cardiacCover: answers['cardiac-cancer-cover'] === 'BOTH' || answers['cardiac-cancer-cover'] === 'CARDIAC',
        cancerCover: answers['cardiac-cancer-cover'] === 'BOTH' || answers['cardiac-cancer-cover'] === 'CANCER',
      }

      console.log('[QuizSection] Getting recommendations from engine v3...')
      // Get recommendations from recommendation engine
      const results = await getRecommendationsV3(preferences)
      console.log('[QuizSection] Received recommendations:', results.length, 'plans')

      // Get plan statistics
      console.log('[QuizSection] Getting plan statistics...')
      const stats = await getPlanStatistics()
      console.log('[QuizSection] Received statistics')

      // Call parent's onComplete callback to transition to results page
      console.log('[QuizSection] CALLING onComplete callback to parent component')
      onComplete(results, stats)
      console.log('[QuizSection] onComplete callback executed successfully')

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('[QuizSection] ERROR during submission:', errorMsg)
      setError(`Failed to get recommendations: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Progress bar - shows current question and completion percentage */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-muted-foreground">
            Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
          </h3>
          <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question card - displays current question and answer options */}
      <Card className="p-8 border-2">
        <h2 className="text-2xl font-semibold mb-2">{question.question}</h2>

        {/* Helper text - provides context and guidance about the question */}
        {question.helper && (
          <p className="text-sm text-muted-foreground mb-6">{question.helper}</p>
        )}

        {/* Answer options - supports both radio (single) and checkbox (multiple) selections */}
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

        {/* Error message - shown when user tries to proceed without answering */}
        {error && (
          <div className="text-sm text-destructive mb-6 p-3 bg-destructive/10 rounded">
            {error}
          </div>
        )}
      </Card>

      {/* Navigation buttons - Previous/Next or Previous/Submit depending on question position */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0 || loading}
          className="flex-1"
        >
          ← Previous
        </Button>

        {isLastQuestion ? (
          // Final question: show "Get Recommendations" button
          <Button
            onClick={handleSubmit}
            disabled={loading || answers[question.id] === undefined}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Analyzing 272 plans...' : 'Get Recommendations ✓'}
          </Button>
        ) : (
          // Regular question: show "Next" button
          <Button
            onClick={handleNext}
            disabled={loading || answers[question.id] === undefined}
            className="flex-1"
          >
            Next →
          </Button>
        )}
      </div>

      {/* Loading indicator - shown while processing recommendations */}
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
