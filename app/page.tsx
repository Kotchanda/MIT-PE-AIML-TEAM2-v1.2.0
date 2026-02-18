/**
 * Home Page - Irish Health Insurance Chooser v3.0
 * Full MIT-PE-AIML-TEAM2 v1.2.0 blueprint implementation
 * Processes 272 insurance plans with NULL-safe scoring
 * 
 * Page Flow:
 * 1. consent → quiz → results → stats
 * 
 * State Management:
 * - pageState: Controls which component is rendered
 * - results: Top 5 recommendations from engine v3
 * - stats: Post-session statistics
 * - loading/error: Blueprint data loading state
 */

'use client'

import { useState, useEffect } from 'react'
import { QuizSection } from '@/components/sections/QuizSection'
import { ResultsSection } from '@/components/sections/ResultsSection'
import { ConsentGate } from '@/components/ConsentGate'
import { PostSessionStatsPanel } from '@/components/PostSessionStatsPanel'
import { loadAllBlueprintData } from '@/lib/load-blueprint-data'
import type { ComparisonResult } from '@/lib/types'

/**
 * Page states:
 * - 'consent': User hasn't accepted consent gate
 * - 'quiz': User is answering quiz questions
 * - 'results': Showing recommendations
 * - 'stats': Showing post-session statistics
 */
type PageState = 'consent' | 'quiz' | 'results' | 'stats'

export default function Home() {
  const [pageState, setPageState] = useState<PageState>('consent')
  const [results, setResults] = useState<ComparisonResult[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load all blueprint data on component mount
   * This pre-loads the 272 plans, question bank, scoring spec, etc.
   * Only runs once due to empty dependency array
   */
  useEffect(() => {
    const initializeBlueprint = async () => {
      try {
        console.log('[Home] 🚀 Initializing MIT-PE-AIML-TEAM2 v1.2.0 blueprint...')
        await loadAllBlueprintData()
        console.log('[Home] ✅ Blueprint data loaded successfully')
        setLoading(false)
      } catch (err) {
        console.error('[Home] ❌ Error loading blueprint data:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load blueprint data. Please refresh the page.'
        )
        setLoading(false)
      }
    }

    initializeBlueprint()
  }, [])

  /**
   * Handle consent acceptance
   * User must accept privacy/consent gate before proceeding to quiz
   */
  const handleConsentAccept = () => {
    console.log('[Home] ✅ User accepted consent gate')
    console.log('[Home] Transitioning: consent → quiz')
    setPageState('quiz')
  }

  /**
   * Handle quiz completion
   * Called when QuizSection's onComplete callback is invoked after user submits final question
   * Receives top 5 recommendations from recommendation engine v3
   */
  const handleQuizComplete = (quizResults: ComparisonResult[], quizStats: any) => {
    console.log('[Home] 🎉 QUIZ COMPLETED - handleQuizComplete callback received')
    console.log('[Home] Received results:', quizResults.length, 'plans')
    console.log('[Home] Received stats:', quizStats)
    console.log('[Home] Transitioning: quiz → results')
    setResults(quizResults)
    setStats(quizStats)
    setPageState('results')
    console.log('[Home] Page state changed to "results"')
  }

  /**
   * Handle results completion
   * User has reviewed recommendations, show post-session stats
   */
  const handleResultsComplete = () => {
    console.log('[Home] 📊 Results reviewed by user')
    console.log('[Home] Transitioning: results → stats')
    setPageState('stats')
  }

  /**
   * Handle restart
   * Reset to quiz state to allow user to try again
   */
  const handleRestart = () => {
    console.log('[Home] 🔄 User clicked restart')
    console.log('[Home] Resetting state and transitioning: * → quiz')
    setResults([])
    setStats(null)
    setPageState('quiz')
  }

  // Show loading state while blueprint data is being loaded
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Loading Irish Health Insurance Chooser
          </h2>
          <p className="text-gray-600">Initializing 272 insurance plans with blueprint data...</p>
        </div>
      </div>
    )
  }

  // Show error state if blueprint data failed to load
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Application</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  // Render based on current page state
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            ❤️ Irish Health Insurance Chooser
          </h1>
          <p className="text-xl text-gray-600">
            Find the perfect health insurance plan for your needs and budget
          </p>
        </div>

        {/* Page content based on state */}
        {pageState === 'consent' && (
          <ConsentGate onAccept={handleConsentAccept} />
        )}

        {pageState === 'quiz' && (
          <QuizSection onComplete={handleQuizComplete} />
        )}

        {pageState === 'results' && (
          <ResultsSection
            results={results}
            stats={stats}
            onComplete={handleResultsComplete}
            onRestart={handleRestart}
          />
        )}

        {pageState === 'stats' && (
          <PostSessionStatsPanel
            stats={stats}
            onRestart={handleRestart}
          />
        )}
      </div>
    </main>
  )
}
