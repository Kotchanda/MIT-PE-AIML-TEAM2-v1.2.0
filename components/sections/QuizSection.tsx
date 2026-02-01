/**
 * Quiz Section Component
 * Interactive questionnaire with session tracking
 * Based on MIT-PE-AIML-TEAM2 v1.2.0 blueprint
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { getSessionTracker } from '@/lib/session-analytics'
import type { UserPreferences } from '@/lib/types'

interface QuizSectionProps {
  onComplete: (preferences: UserPreferences) => void
}

/**
 * Quiz questions with priority weights from blueprint
 * Higher priority = more informative for recommendations
 */
const QUIZ_QUESTIONS = [
  {
    id: 'Q_HOSPITAL_LEVEL',
    priority: 1,
    title: 'Hospital Level Preference',
    description: 'What type of hospital accommodation do you prefer?',
    type: 'radio',
    options: [
      { value: 'Public only', label: 'Public hospitals only' },
      { value: 'Private', label: 'Private hospitals' },
      { value: 'Hi-Tech', label: 'Hi-tech private facilities' },
    ],
  },
  {
    id: 'Q_FAMILY_SIZE',
    priority: 2,
    title: 'Family Composition',
    description: 'How many people need to be covered?',
    type: 'family-size',
  },
  {
    id: 'Q_PRICE_POSTURE',
    priority: 3,
    title: 'Budget & Price Sensitivity',
    description: 'What is your approach to pricing?',
    type: 'radio',
    options: [
      { value: 'Price-sensitive', label: 'Price-sensitive (budget-conscious)' },
      { value: 'Balanced', label: 'Balanced (value for money)' },
      { value: 'Benefit-maximizing', label: 'Benefit-maximizing (comprehensive coverage)' },
    ],
  },
  {
    id: 'Q_MATERNITY',
    priority: 4,
    title: 'Maternity Coverage',
    description: 'Do you need maternity coverage?',
    type: 'checkbox',
  },
  {
    id: 'Q_MENTAL_HEALTH',
    priority: 5,
    title: 'Mental Health Services',
    description: 'Is mental health coverage important to you?',
    type: 'checkbox',
  },
  {
    id: 'Q_OVERSEAS',
    priority: 6,
    title: 'Overseas Coverage',
    description: 'Do you need overseas emergency coverage?',
    type: 'checkbox',
  },
]

export function QuizSection({ onComplete }: QuizSectionProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)

  const tracker = getSessionTracker()
  const totalSteps = QUIZ_QUESTIONS.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  /**
   * Handle answer to current question
   */
  const handleAnswer = (value: any) => {
    const questionId = QUIZ_QUESTIONS[currentStep].id

    // Track question and answer
    tracker.recordQuestion(questionId)
    tracker.recordAnswer(questionId, JSON.stringify(value))

    setAnswers({
      ...answers,
      [questionId]: value,
    })

    // Auto-advance to next question
    if (currentStep < totalSteps - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 300)
    }
  }

  /**
   * Handle family size changes
   */
  const handleFamilySizeChange = (type: 'adults' | 'children', value: number) => {
    if (type === 'adults') {
      setAdults(Math.max(1, value))
    } else {
      setChildren(Math.max(0, value))
    }
  }

  /**
   * Complete quiz and generate recommendations
   */
  const handleComplete = () => {
    const questionId = QUIZ_QUESTIONS[currentStep].id
    tracker.recordQuestion(questionId)
    tracker.recordAnswer(questionId, JSON.stringify({ adults, children }))

    // Build preferences object
    const preferences: UserPreferences = {
      adults,
      children,
      dependents: 0,
      hospitalLevel: answers['Q_HOSPITAL_LEVEL'] || 'Private',
      pricePosture: answers['Q_PRICE_POSTURE'] || 'Balanced',
      needsMaternity: answers['Q_MATERNITY'] || false,
      needsMentalHealth: answers['Q_MENTAL_HEALTH'] || false,
      needsOverseas: answers['Q_OVERSEAS'] || false,
    }

    // Notify parent component
    onComplete(preferences)
  }

  /**
   * Navigate to previous question
   */
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  /**
   * Navigate to next question
   */
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const currentQuestion = QUIZ_QUESTIONS[currentStep]
  const isAnswered = answers[currentQuestion.id] !== undefined
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Question {currentStep + 1} of {totalSteps}</h3>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      {/* Question Card */}
      <Card className="p-8">
        <div className="space-y-6">
          {/* Question Title */}
          <div>
            <h2 className="text-2xl font-bold mb-2">{currentQuestion.title}</h2>
            <p className="text-muted-foreground">{currentQuestion.description}</p>
          </div>

          {/* Question Content */}
          <div className="space-y-4">
            {currentQuestion.type === 'radio' && (
              <RadioGroup value={answers[currentQuestion.id] || ''} onValueChange={handleAnswer}>
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer font-medium">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {currentQuestion.type === 'checkbox' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={currentQuestion.id}
                  checked={answers[currentQuestion.id] || false}
                  onCheckedChange={handleAnswer}
                />
                <Label htmlFor={currentQuestion.id} className="cursor-pointer font-medium">
                  Yes, I need this coverage
                </Label>
              </div>
            )}

            {currentQuestion.type === 'family-size' && (
              <div className="space-y-6">
                {/* Adults */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium">Adults</Label>
                    <span className="text-2xl font-bold text-blue-600">{adults}</span>
                  </div>
                  <Slider
                    value={[adults]}
                    onValueChange={(value) => handleFamilySizeChange('adults', value[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>5+</span>
                  </div>
                </div>

                {/* Children */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium">Children</Label>
                    <span className="text-2xl font-bold text-blue-600">{children}</span>
                  </div>
                  <Slider
                    value={[children]}
                    onValueChange={(value) => handleFamilySizeChange('children', value[0])}
                    min={0}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>5+</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Total coverage needed:</strong> {adults} adult{adults !== 1 ? 's' : ''}{' '}
                    {children > 0 && `+ ${children} child${children !== 1 ? 'ren' : ''}`}
                  </p>
                </div>

                {/* Mark as answered */}
                <Button
                  onClick={() => handleAnswer({ adults, children })}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Confirm Family Size
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={currentStep === 0}
          className="flex-1"
        >
          ← Previous
        </Button>

        {!isLastStep ? (
          <Button
            onClick={handleNext}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={currentQuestion.type === 'family-size' && !isAnswered}
          >
            Next →
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Get Recommendations ✓
          </Button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="flex gap-2 justify-center">
        {QUIZ_QUESTIONS.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 w-2 rounded-full transition-colors ${
              idx <= currentStep ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
