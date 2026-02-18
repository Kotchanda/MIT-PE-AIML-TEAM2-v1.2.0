/**
 * API Route: POST /api/adaptive-quiz/next-question
 * 
 * Fetches the next best question for the adaptive quiz based on:
 * - Questions already answered in the session
 * - Statistical relevance (discriminative power) of remaining questions
 * - User's current answers to provide contextual recommendations
 * 
 * This implements the adaptive ranking system that prioritizes questions
 * with the highest statistical relevance to finding the best insurance plan.
 */

import { NextRequest, NextResponse } from 'next/server'
import { queryAll, queryOne, execute } from '@/lib/db'
import { rankQuestionsForSession } from '@/lib/adaptive-ranking-engine'

interface QuestionStatistics {
  questionKey: string
  questionText: string
  questionType: string
  discriminativePower: number
  isActive: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, answeredQuestions = [], currentAnswers = {} } = body

    console.log('[API] /adaptive-quiz/next-question called')
    console.log('[API] Session ID:', sessionId)
    console.log('[API] Answered questions:', answeredQuestions.length)

    // Validate session exists
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Fetch session from database using raw SQL
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

    console.log('[API] Session found')

    // Get all available questions from database using raw SQL
    const allQuestions = await queryAll<QuestionStatistics>(
      `SELECT "questionKey", "questionText", "questionType", "discriminativePower", "isActive"
       FROM "QuestionStatistics"
       WHERE "isActive" = true
       ORDER BY "discriminativePower" DESC`
    )

    console.log('[API] Total active questions in database:', allQuestions.length)

    // Filter out already answered questions
    const remainingQuestions = allQuestions.filter(
      (q) => !answeredQuestions.includes(q.questionKey)
    )

    console.log('[API] Remaining questions:', remainingQuestions.length)

    if (remainingQuestions.length === 0) {
      console.log('[API] No more questions available - quiz complete')
      return NextResponse.json({
        nextQuestion: null,
        quizComplete: true,
        message: 'All questions answered',
      })
    }

    // Rank remaining questions based on adaptive algorithm
    console.log('[API] Ranking questions using adaptive algorithm...')
    const rankedQuestions = await rankQuestionsForSession(
      sessionId,
      remainingQuestions,
      currentAnswers
    )

    console.log('[API] Top ranked question:', rankedQuestions[0]?.questionKey)

    // Get the next best question
    const nextQuestion = rankedQuestions[0]

    // Update session with latest activity using raw SQL
    await execute(
      `UPDATE "AdaptiveQuizSession" 
       SET "updatedAt" = NOW()
       WHERE "sessionId" = $1`,
      [sessionId]
    )

    return NextResponse.json({
      nextQuestion: {
        id: nextQuestion.questionKey,
        key: nextQuestion.questionKey,
        text: nextQuestion.questionText,
        type: nextQuestion.questionType,
        relevanceScore: nextQuestion.discriminativePower,
        position: answeredQuestions.length + 1,
        totalQuestions: allQuestions.length,
      },
      quizComplete: false,
      remainingQuestions: remainingQuestions.length - 1,
    })
  } catch (error) {
    console.error('[API] Error in /adaptive-quiz/next-question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch next question', details: String(error) },
      { status: 500 }
    )
  }
}
