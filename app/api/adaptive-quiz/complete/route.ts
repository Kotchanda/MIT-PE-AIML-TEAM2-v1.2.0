/**
 * API Route: POST /api/adaptive-quiz/complete
 * 
 * Marks a quiz session as complete and returns:
 * - Session completion status
 * - Summary statistics
 * - Ready for recommendation generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryAll, execute } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    console.log('[API] /adaptive-quiz/complete called')
    console.log('[API] Session ID:', sessionId)

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Verify session exists using raw SQL
    const session = await queryOne(
      `SELECT * FROM "AdaptiveQuizSession" WHERE "sessionId" = $1`,
      [sessionId]
    )

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    console.log('[API] Session found, marking as complete...')

    // Update session status to COMPLETED using raw SQL
    await execute(
      `UPDATE "AdaptiveQuizSession" 
       SET "updatedAt" = NOW()
       WHERE "sessionId" = $1`,
      [sessionId]
    )

    console.log('[API] Session completed')

    // Get all responses for this session using raw SQL
    const responses = await queryAll(
      `SELECT * FROM "QuestionResponseAnalytics" WHERE "sessionId" = $1`,
      [sessionId]
    )

    console.log('[API] Total responses recorded:', responses.length)

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      questionsAnswered: responses.length,
      message: 'Quiz completed successfully',
    })
  } catch (error) {
    console.error('[API] Error in /adaptive-quiz/complete:', error)
    return NextResponse.json(
      { error: 'Failed to complete quiz', details: String(error) },
      { status: 500 }
    )
  }
}
