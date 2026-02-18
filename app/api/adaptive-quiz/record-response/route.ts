/**
 * API Endpoint: POST /api/adaptive-quiz/record-response
 * 
 * Records a user's answer to a quiz question and updates statistics
 * 
 * Request Body:
 * {
 *   questionKey: string,
 *   answerValue: string,
 *   plansRemaining: number
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   updatedStats: {
 *     totalResponses: number,
 *     discriminativePower: number
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { adaptiveRankingEngine } from '@/lib/adaptive-ranking-engine'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { questionKey, answerValue, plansRemaining } = body

    // Validate required fields
    if (!questionKey || !answerValue) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: questionKey, answerValue',
        },
        { status: 400 }
      )
    }

    // Record the response in the database
    await adaptiveRankingEngine.recordQuestionResponse(
      questionKey,
      answerValue,
      plansRemaining || 272
    )

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Response recorded for question: ${questionKey}`,
        recordedData: {
          questionKey,
          answerValue,
          plansRemaining: plansRemaining || 272,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error recording response:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record response',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
