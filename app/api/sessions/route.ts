/**
 * Session Management API Routes
 * 
 * POST /api/sessions - Create a new session
 * GET /api/sessions/:id - Retrieve session details
 * PUT /api/sessions/:id - Update session with quiz responses
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    // Create new session in database
    const session = await prisma.session.create({
      data: {
        userAgent,
        ipAddress,
        privacyConsented: false, // Will be updated after privacy gate
        questionsAnswered: 0,
      },
    })

    return NextResponse.json(
      {
        id: session.id,
        sessionToken: session.sessionToken,
        createdAt: session.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
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

    // Retrieve session from database
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

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
      { error: 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}
