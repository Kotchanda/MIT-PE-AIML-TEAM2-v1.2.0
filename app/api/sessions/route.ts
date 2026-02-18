/**
 * Session Management API Routes
 * 
 * POST /api/sessions - Create a new session
 * GET /api/sessions/:id - Retrieve session details
 * PUT /api/sessions/:id - Update session with quiz responses
 */

import { NextRequest, NextResponse } from 'next/server'
import { execute, queryOne } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

/**
 * POST /api/sessions
 * Create a new session for a user starting the quiz
 * 
 * Returns: { id, sessionToken, createdAt }
 */
export async function POST(request: NextRequest) {
  try {
    // Extract optional user agent and IP from request headers
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || undefined

    // Create new session in database using raw SQL
    const sessionId = uuidv4()
    const sessionToken = uuidv4()
    
    await execute(
      `INSERT INTO "Session" 
       ("id", "sessionToken", "userAgent", "ipAddress", "privacyConsented", "questionsAnswered", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [sessionId, sessionToken, userAgent, ipAddress, false, 0]
    )

    return NextResponse.json(
      {
        id: sessionId,
        sessionToken: sessionToken,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sessions/:id
 * Retrieve session details by ID
 * 
 * Query params:
 * - token: sessionToken for verification (optional but recommended)
 * 
 * Returns: Full session object with all quiz responses and recommendations
 */
export async function GET(request: NextRequest) {
  try {
    // Extract session ID from URL path
    const sessionId = request.nextUrl.pathname.split('/').pop()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve session from database using raw SQL
    const session = await queryOne(
      `SELECT * FROM "Session" WHERE "id" = $1`,
      [sessionId]
    )

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(session, { status: 200 })
  } catch (error) {
    console.error('Error retrieving session:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session', details: String(error) },
      { status: 500 }
    )
  }
}
