/**
 * API Endpoint: POST /api/adaptive-quiz/initialize
 * 
 * Initializes the question statistics table with all available quiz questions
 * Should be called once during app setup or when resetting the adaptive system
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   questionsInitialized: number,
 *   questions: Array<{
 *     questionKey: string,
 *     questionText: string,
 *     questionType: string
 *   }>
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { adaptiveRankingEngine } from '@/lib/adaptive-ranking-engine'

export async function POST(request: NextRequest) {
  try {
    // Initialize question statistics
    const createdQuestions = await adaptiveRankingEngine.initializeQuestionStatistics()

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Initialized ${createdQuestions.length} questions for adaptive quiz system`,
        questionsInitialized: createdQuestions.length,
        questions: createdQuestions.map((q) => ({
          questionKey: q.questionKey,
          questionText: q.questionText,
          questionType: q.questionType,
          discriminativePower: q.discriminativePower,
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error initializing questions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize questions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
