/**
 * API Route: POST /api/adaptive-quiz/start-session
 * 
 * Initializes a new adaptive quiz session and returns:
 * - sessionId: Unique identifier for tracking this quiz attempt
 * - firstQuestion: The first question to present to the user
 * 
 * The session tracks:
 * - Questions answered so far
 * - User's answers and response times
 * - Session start/end times
 * - Overall progress through the quiz
 * 
 * Uses raw PostgreSQL queries instead of Prisma for better reliability
 */

import { NextRequest, NextResponse } from 'next/server'
import { query, queryAll } from '@/lib/db'
import { rankQuestionsForSession } from '@/lib/adaptive-ranking-engine'
import { v4 as uuidv4 } from 'uuid'

interface QuestionStatistics {
  questionKey: string
  questionText: string
  questionType: string
  discriminativePower: number
  isActive: boolean
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] /adaptive-quiz/start-session called')

    // Generate a unique session ID
    const sessionId = uuidv4()
    const id = uuidv4()

    // Create a new adaptive quiz session using raw SQL
    // Match the actual schema: id, sessionId, currentQuestionIndex, questionsAskedOrder, plansRemainingCount, etc.
    console.log('[API] Creating new session...')
    const sessionResult = await query(
      `INSERT INTO "AdaptiveQuizSession" 
       ("id", "sessionId", "currentQuestionIndex", "questionsAskedOrder", "plansRemainingCount", "totalTimeSpent", "updatedAt", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, "sessionId"`,
      [id, sessionId, 0, JSON.stringify([]), 272, 0]
    )

    const createdSessionId = sessionResult.rows[0].sessionId
    console.log('[API] Session created:', createdSessionId)

    // Get all active questions from database using raw SQL
    const allQuestions = await queryAll<QuestionStatistics>(
      `SELECT "questionKey", "questionText", "questionType", "discriminativePower", "isActive"
       FROM "QuestionStatistics"
       WHERE "isActive" = true
       ORDER BY "discriminativePower" DESC`
    )

    console.log('[API] Total active questions:', allQuestions.length)

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available' },
        { status: 500 }
      )
    }

    // Rank questions for this new session (no answers yet)
    console.log('[API] Ranking questions for new session...')
    const rankedQuestions = await rankQuestionsForSession(
      createdSessionId,
      allQuestions,
      {} // No answers yet
    )

    // Get the first question
    const firstQuestion = rankedQuestions[0]

    console.log('[API] First question:', firstQuestion.questionKey)

    return NextResponse.json({
      sessionId: createdSessionId,
      firstQuestion: {
        id: firstQuestion.questionKey,
        key: firstQuestion.questionKey,
        text: firstQuestion.questionText,
        type: firstQuestion.questionType,
        position: 1,
        totalQuestions: allQuestions.length,
      },
      message: 'Session started successfully',
    })
  } catch (error) {
    console.error('[API] Error in /adaptive-quiz/start-session:', error)
    return NextResponse.json(
      { error: 'Failed to start session', details: String(error) },
      { status: 500 }
    )
  }
}
