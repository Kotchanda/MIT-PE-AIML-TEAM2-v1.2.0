/**
 * Enhanced Quiz Section Component - Adaptive Question Ordering
 * 
 * This version integrates with the adaptive ranking engine to:
 * 1. Start a new quiz session
 * 2. Fetch the next best question based on statistical relevance
 * 3. Record each answer and update session progress
 * 4. Complete the quiz and generate recommendations
 * 
 * Questions are ordered dynamically based on discriminative power,
 * allowing users to find their ideal plan faster.
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { getRecommendationsV3, getPlanStatistics } from '@/lib/recommendation-engine-v3'
import type { ComparisonResult } from '@/lib/types'

interface QuizSectionAdaptiveProps {
  onComplete: (results: ComparisonResult[], stats: any) => void
}

// Map question keys to preference fields for recommendation engine
const QUESTION_KEY_TO_PREFERENCE: Record<string, string> = {
  'familyComposition': 'dependents',
  'ageGroup': 'ageGroup',
  'hospitalLevel': 'hospitalLevel',
  'dayCaseProcedures': 'dayCase',
  'consultantChoice': 'consultantChoice',
  'dayToDayBenefits': 'dayToDayBenefits',
  'gpVisits': 'gpVisits',
  'dentalOptical': 'dentalOptical',
  'physiotherapy': 'physiotherapy',
  'outpatientSpecialists': 'outpatientCover',
  'mentalHealth': 'mentalHealthCover',
  'maternity': 'maternityNeeded',
  'maternityExtras': 'maternityExtras',
  'menopauseCover': 'menopauseCover',
  'genderAffirmation': 'genderAffirmation',
  'cardiacCancerCover': 'cardiacCancerCover',
  'travelInsurance': 'overseasCoverage',
  'plannedTreatmentAbroad': 'plannedTreatmentAbroad',
  'budgetPriority': 'budgetPriority',
  'claimsSpeed': 'claimsSpeed',
  'wellnessPrograms': 'wellnessPrograms',
  'alternativeMedicine': 'alternativeMedicine',
  'providerPreference': 'providerPreference',
  'customerService': 'customerService',
}

export function QuizSectionAdaptive({ onComplete }: QuizSectionAdaptiveProps) {
  // Session management
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStatus, setSessionStatus] = useState<'initializing' | 'in-progress' | 'completing' | 'completed'>('initializing')

  // Question management
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([])

  // Answer management
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [currentAnswer, setCurrentAnswer] = useState<any>(null)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('[QuizAdaptive] Initializing new session...')
        setSessionStatus('initializing')

        // Start a new adaptive quiz session
        const response = await fetch('/api/adaptive-quiz/start-session', {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Failed to start session')
        }

        const data = await response.json()
        console.log('[QuizAdaptive] Session started:', data.sessionId)
        console.log('[QuizAdaptive] First question:', data.firstQuestion.key)

        setSessionId(data.sessionId)
        setCurrentQuestion(data.firstQuestion)
        setTotalQuestions(data.firstQuestion.totalQuestions)
        setQuestionNumber(1)
        setSessionStatus('in-progress')
        setError('')
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error('[QuizAdaptive] Error initializing session:', errorMsg)
        setError(`Failed to start quiz: ${errorMsg}`)
      }
    }

    initializeSession()
  }, [])

  // Handle answer selection
  const handleAnswer = (value: any) => {
    console.log(`[QuizAdaptive] Answer selected for Q${questionNumber}:`, value)
    setCurrentAnswer(value)
    setError('')
  }

  // Handle next button - record answer and fetch next question
  const handleNext = async () => {
    if (currentAnswer === null || currentAnswer === undefined) {
      setError('Please select an answer before continuing')
      return
    }

    if (!sessionId || !currentQuestion) {
      setError('Session error - please refresh')
      return
    }

    setLoading(true)
    try {
      console.log(`[QuizAdaptive] Recording answer for Q${questionNumber}...`)

      // Record the answer
      await fetch('/api/adaptive-quiz/record-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionKey: currentQuestion.key,
          answer: currentAnswer,
          answerValue: currentAnswer.toString(),
        }),
      })

      console.log('[QuizAdaptive] Answer recorded, fetching next question...')

      // Update local state
      const newAnsweredQuestions = [...answeredQuestions, currentQuestion.key]
      setAnsweredQuestions(newAnsweredQuestions)
      setAnswers({
        ...answers,
        [currentQuestion.key]: currentAnswer,
      })

      // Fetch next question
      const nextResponse = await fetch('/api/adaptive-quiz/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answeredQuestions: newAnsweredQuestions,
          currentAnswers: { ...answers, [currentQuestion.key]: currentAnswer },
        }),
      })

      if (!nextResponse.ok) {
        throw new Error('Failed to fetch next question')
      }

      const nextData = await nextResponse.json()

      if (nextData.quizComplete) {
        console.log('[QuizAdaptive] No more questions - quiz complete')
        await completeQuiz()
      } else {
        console.log('[QuizAdaptive] Next question:', nextData.nextQuestion.key)
        setCurrentQuestion(nextData.nextQuestion)
        setQuestionNumber(questionNumber + 1)
        setCurrentAnswer(null)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('[QuizAdaptive] Error moving to next question:', errorMsg)
      setError(`Error: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle previous button
  const handlePrevious = () => {
    if (questionNumber > 1) {
      console.log(`[QuizAdaptive] Moving back from Q${questionNumber}`)
      const previousQuestionKey = answeredQuestions[answeredQuestions.length - 1]
      setCurrentAnswer(answers[previousQuestionKey] || null)
      setQuestionNumber(questionNumber - 1)
      setError('')
    }
  }

  // Complete quiz and generate recommendations
  const completeQuiz = async () => {
    if (!sessionId) {
      setError('Session error')
      return
    }

    setSessionStatus('completing')
    setLoading(true)

    try {
      console.log('[QuizAdaptive] Completing quiz session...')

      // Mark session as complete
      await fetch('/api/adaptive-quiz/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      console.log('[QuizAdaptive] Session marked complete, generating recommendations...')

      // Convert answers to UserPreferences format
      const preferences: any = {}
      Object.entries(answers).forEach(([questionKey, answer]) => {
        const prefKey = QUESTION_KEY_TO_PREFERENCE[questionKey]
        if (prefKey) {
          preferences[prefKey] = answer
        }
      })

      console.log('[QuizAdaptive] Preferences:', preferences)

      // Get recommendations
      const results = await getRecommendationsV3(preferences)
      console.log('[QuizAdaptive] Received recommendations:', results.length)

      // Get statistics
      const stats = await getPlanStatistics()
      console.log('[QuizAdaptive] Received statistics')

      setSessionStatus('completed')
      onComplete(results, stats)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('[QuizAdaptive] Error completing quiz:', errorMsg)
      setError(`Failed to complete quiz: ${errorMsg}`)
      setSessionStatus('in-progress')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while initializing
  if (!currentQuestion) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            <div>
              <p className="font-medium text-blue-900">Starting adaptive quiz...</p>
              <p className="text-sm text-blue-700">Loading first question based on statistical relevance</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const progress = ((questionNumber) / totalQuestions) * 100
  const isLastQuestion = answeredQuestions.length === totalQuestions - 1

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </h3>
          <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question card */}
      <Card className="p-8 border-2">
        <h2 className="text-2xl font-semibold mb-2">{currentQuestion.text}</h2>

        {currentQuestion.relevanceScore && (
          <p className="text-xs text-muted-foreground mb-6 italic">
            Relevance Score: {(currentQuestion.relevanceScore * 100).toFixed(1)}%
          </p>
        )}

        {/* Answer options - radio buttons */}
        <div className="space-y-4 mb-8">
          <RadioGroup value={currentAnswer?.toString() || ''} onValueChange={handleAnswer}>
            {/* Note: In production, fetch question options from database */}
            {/* For now, using placeholder - will be replaced with actual question data */}
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="option1" id="option-1" />
              <Label htmlFor="option-1" className="text-base font-normal cursor-pointer flex-1">
                Option 1
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="option2" id="option-2" />
              <Label htmlFor="option-2" className="text-base font-normal cursor-pointer flex-1">
                Option 2
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-sm text-destructive mb-6 p-3 bg-destructive/10 rounded">
            {error}
          </div>
        )}
      </Card>

      {/* Navigation buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={questionNumber === 1 || loading}
          className="flex-1"
        >
          ← Previous
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={completeQuiz}
            disabled={loading || currentAnswer === null}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Analyzing plans...' : 'Get Recommendations ✓'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={loading || currentAnswer === null}
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
              <p className="font-medium text-blue-900">Processing your answer...</p>
              <p className="text-sm text-blue-700">Finding the next most relevant question</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
