/**
 * API Route: POST /api/adaptive-quiz/record-answer
 * 
 * Records a user's answer to a quiz question and updates:
 * - QuestionResponseAnalytics: Tracks how users answer each question
 * - AdaptiveQuizSession: Updates session progress
 * - QuestionStatistics: Updates discriminative power based on responses
 * 
 * This data feeds into the adaptive ranking engine to improve question ordering.
 */

import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, questionKey, answer, answerValue } = body

    console.log('[API] /adaptive-quiz/record-answer called')
    console.log('[API] Question:', questionKey, 'Answer:', answer)

    // Validate required fields
    if (!sessionId || !questionKey || answer === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, questionKey, answer' },
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

    // Verify question exists using raw SQL
    const question = await queryOne(
      `SELECT * FROM "QuestionStatistics" WHERE "questionKey" = $1`,
      [questionKey]
    )

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Record the answer in QuestionResponseAnalytics using raw SQL
    console.log('[API] Recording answer in analytics...')
    await execute(
      `INSERT INTO "QuestionResponseAnalytics" 
       ("sessionId", "questionKey", "userAnswer", "answerValue", "responseTime", "createdAt")
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [sessionId, questionKey, JSON.stringify(answer), answerValue || answer.toString(), 0]
    )

    console.log('[API] Answer recorded')

    // Update QuestionStatistics with new response using raw SQL
    console.log('[API] Updating question statistics...')
    await execute(
      `UPDATE "QuestionStatistics" 
       SET "totalResponses" = "totalResponses" + 1,
           "lastUpdated" = NOW()
       WHERE "questionKey" = $1`,
      [questionKey]
    )

    // Update session progress using raw SQL
    console.log('[API] Updating session progress...')
    await execute(
      `UPDATE "AdaptiveQuizSession" 
       SET "updatedAt" = NOW()
       WHERE "sessionId" = $1`,
      [sessionId]
    )

    return NextResponse.json({
      success: true,
      message: 'Answer recorded successfully',
    })
  } catch (error) {
    console.error('[API] Error in /adaptive-quiz/record-answer:', error)
    return NextResponse.json(
      { error: 'Failed to record answer', details: String(error) },
      { status: 500 }
    )
  }
}
