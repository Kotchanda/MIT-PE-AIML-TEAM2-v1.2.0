/**
 * Quiz Section Component - Adaptive Questionnaire
 * Implements MIT-PE-AIML-TEAM2 v1.2.0 blueprint with 272 insurance plans
 * Uses NULL-safe scoring and tie-breaker logic
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
 * Quiz questions - Adaptive questionnaire from blueprint
 * Each question maps to user preferences that drive the recommendation engine
 */
const QUIZ_QUESTIONS = [
  {
    id: 'hospital-level',
    question: 'What level of hospital cover do you prefer?',
    type: 'radio',
    options: [
      { label: 'Public hospitals only', value: 'PUBLIC' },
      { label: 'Semi-private rooms', value: 'SEMI_PRIVATE' },
      { label: 'Private hospitals', value: 'PRIVATE' },
      { label: 'High-tech private facilities', value: 'HI_TECH' },
    ],
    helper: 'This is the most important factor in plan selection',
  },
  {
    id: 'outpatient-cover',
    question: 'Do you need outpatient cover?',
    type: 'radio',
    options: [
      { label: 'Yes, outpatient services are important', value: true },
      { label: 'No, not necessary for me', value: false },
    ],
    helper: 'Covers visits to specialists and clinics outside hospitals',
  },
  {
    id: 'gp-visits',
    question: 'Do you want GP visit coverage?',
    type: 'radio',
    options: [
      { label: 'Yes, I visit my GP regularly', value: true },
      { label: 'No, I rarely need GP services', value: false },
    ],
    helper: 'Covers general practitioner consultations',
  },
  {
    id: 'maternity',
    question: 'Do you need maternity cover?',
    type: 'radio',
    options: [
      { label: 'Yes, maternity cover is essential', value: true },
      { label: 'No, not applicable to me', value: false },
    ],
    helper: 'Includes pregnancy, delivery, and postnatal care',
  },
  {
    id: 'mental-health',
    question: 'Is mental health coverage important?',
    type: 'radio',
    options: [
      { label: 'Yes, mental health support is important', value: true },
      { label: 'No, not a priority for me', value: false },
    ],
    helper: 'Covers counseling, therapy, and psychiatric services',
  },
  {
    id: 'overseas',
    question: 'Do you need overseas emergency coverage?',
    type: 'radio',
    options: [
      { label: 'Yes, I need this coverage', value: true },
      { label: 'No, not necessary', value: false },
    ],
    helper: 'Emergency medical coverage while traveling abroad',
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
      const preferences: UserPreferences = {
        hospitalLevel: answers['hospital-level'],
        outpatientCover: answers['outpatient-cover'],
        gpVisits: answers['gp-visits'],
        maternityNeeded: answers['maternity'],
        mentalHealthCover: answers['mental-health'],
        overseasCoverage: answers['overseas'],
      }

      console.log('📋 Quiz answers:', answers)
      console.log('🎯 User preferences:', preferences)

      // Get recommendations from engine v3 (processes 272 plans)
      const results = await getRecommendationsV3(preferences)
      console.log('✅ Recommendations generated:', results.length)

      // Get plan statistics for post-session panel
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

        {/* Helper text */}
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
              ))}
            </RadioGroup>
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
              ))}
            </div>
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
            {loading ? 'Generating recommendations...' : 'Get Recommendations ✓'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={loading || answers[question.id] === undefined}
            className="flex-1"
          >
            Next →
          </Button>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            <div>
              <p className="font-medium text-blue-900">Processing your preferences...</p>
              <p className="text-sm text-blue-700">Analyzing 272 insurance plans with NULL-safe scoring</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
