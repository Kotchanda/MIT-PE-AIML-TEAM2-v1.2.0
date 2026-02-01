/**
 * Main Page - Irish Health Insurance Chooser v2.0
 * Integrates advanced features from MIT-PE-AIML-TEAM2 blueprint
 */

'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuizSection } from '@/components/sections/QuizSection'
import { RecommendationResultsV2 } from '@/components/sections/RecommendationResultsV2'
import ProviderOverview from '@/components/sections/ProviderOverview'
import ComparisonTable from '@/components/sections/ComparisonTable'
import { ConsentGate } from '@/components/ConsentGate'
import { PostSessionStatsPanel } from '@/components/PostSessionStatsPanel'
import { getRecommendationsV2 } from '@/lib/recommendation-engine-v2'
import { getSessionTracker, getMockQuestionRankingSnapshot } from '@/lib/session-analytics'
import type { UserPreferences, ComparisonResult } from '@/lib/types'

export default function Home() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    adults: 1,
    children: 0,
    dependents: 0,
  })
  const [recommendations, setRecommendations] = useState<ComparisonResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [showConsentGate, setShowConsentGate] = useState(true)
  const [showPostSessionStats, setShowPostSessionStats] = useState(false)
  const [userSatisfied, setUserSatisfied] = useState<boolean | null>(null)

  // Initialize session tracker
  useEffect(() => {
    const tracker = getSessionTracker()
    // Track initial page load
    tracker.recordQuestion('Q_INITIAL_LOAD')
  }, [])

  /**
   * Handle quiz completion
   * Generates recommendations and tracks session
   */
  const handleQuizComplete = (userPrefs: UserPreferences) => {
    const tracker = getSessionTracker()

    // Update preferences
    setPreferences(userPrefs)

    // Generate recommendations using v2 engine
    const results = getRecommendationsV2(userPrefs)
    setRecommendations(results)

    // Track plans presented
    tracker.recordPlansPresented(results.map((r) => r.plan.id))

    // Show results
    setShowResults(true)

    // Scroll to results
    setTimeout(() => {
      const resultsTab = document.querySelector('[value="results"]')
      resultsTab?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  /**
   * Handle plan selection
   */
  const handleSelectPlan = (planId: string) => {
    const tracker = getSessionTracker()
    tracker.recordPlanClicked(planId)

    // In production, this would navigate to quote page
    console.log('Selected plan:', planId)
  }

  /**
   * Handle consent decision
   */
  const handleConsent = (consented: boolean) => {
    setShowConsentGate(false)
    // In production, this would enable/disable analytics tracking
    console.log('Analytics consent:', consented)
  }

  /**
   * Handle satisfaction rating
   */
  const handleSatisfactionRating = (satisfied: boolean) => {
    const tracker = getSessionTracker()
    tracker.recordSatisfaction(satisfied)
    setUserSatisfied(satisfied)

    // Show post-session stats after rating
    setTimeout(() => {
      setShowPostSessionStats(true)
    }, 500)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Consent Gate */}
      {showConsentGate && <ConsentGate onConsent={handleConsent} />}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">❤️</div>
            <h1 className="text-4xl font-bold">Irish Health Insurance Chooser</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Find the perfect health insurance plan for your needs and budget
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="find-plan" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="find-plan">Find Plan</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="results" disabled={!showResults}>
              Results
            </TabsTrigger>
          </TabsList>

          {/* Find Plan Tab - Interactive Quiz */}
          <TabsContent value="find-plan" className="space-y-6">
            <QuizSection onComplete={handleQuizComplete} />
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <ProviderOverview />
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-6">
            <ComparisonTable />
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {showResults && (
              <>
                {/* Recommendations */}
                <RecommendationResultsV2 results={recommendations} onSelectPlan={handleSelectPlan} />

                {/* Satisfaction Rating */}
                <div className="mt-8 p-6 bg-white rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">How helpful were these recommendations?</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleSatisfactionRating(true)}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        userSatisfied === true
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                      }`}
                    >
                      😊 Very Helpful
                    </button>
                    <button
                      onClick={() => handleSatisfactionRating(false)}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        userSatisfied === false
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                      }`}
                    >
                      😕 Not Helpful
                    </button>
                  </div>
                </div>

                {/* Post-Session Stats Panel */}
                {showPostSessionStats && (
                  <PostSessionStatsPanel
                    topQuestions={getMockQuestionRankingSnapshot().top_questions}
                    bottomQuestions={getMockQuestionRankingSnapshot().bottom_questions}
                    deltas={getMockQuestionRankingSnapshot().deltas_since_last_release}
                    timeSpent={getSessionTracker().getElapsedTime()}
                    questionsAnswered={Object.keys(preferences).length}
                    userSatisfied={userSatisfied}
                  />
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
