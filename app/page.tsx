/**
 * Home Page - Irish Health Insurance Chooser v3.0
 * Full MIT-PE-AIML-TEAM2 v1.2.0 blueprint implementation
 * Processes 272 insurance plans with NULL-safe scoring
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
   */
  useEffect(() => {
    const initializeBlueprint = async () => {
      try {
        console.log('🚀 Initializing MIT-PE-AIML-TEAM2 v1.2.0 blueprint...')
        await loadAllBlueprintData()
        console.log('✅ Blueprint data loaded successfully')
        setLoading(false)
      } catch (err) {
        console.error('❌ Error loading blueprint data:', err)
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
   * User must accept privacy/consent gate before proceeding
   */
  const handleConsentAccept = () => {
    console.log('✅ User accepted consent gate')
    setPageState('quiz')
  }

  /**
   * Handle quiz completion
   * Called when user submits quiz answers
   * Receives top 5 recommendations from engine v3
   */
  const handleQuizComplete = (quizResults: ComparisonResult[], quizStats: any) => {
    console.log('🎉 Quiz completed, showing results')
    setResults(quizResults)
    setStats(quizStats)
    setPageState('results')
  }

  /**
   * Handle results completion
   * User has reviewed recommendations, show post-session stats
   */
  const handleResultsComplete = () => {
    console.log('📊 Showing post-session statistics')
    setPageState('stats')
  }

  /**
   * Handle restart
   * Reset to quiz state to allow user to try again
   */
  const handleRestart = () => {
    console.log('🔄 Restarting quiz')
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
