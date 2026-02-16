/**
 * Session Update API Route
 * 
 * PUT /api/sessions/:id - Update session with quiz responses and recommendations
 * PATCH /api/sessions/:id - Partial update of session
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * PUT /api/sessions/:id
 * Update session with quiz responses and/or recommendations
 * 
 * Request body:
 * {
 *   ageGroup?: string,
 *   budgetRange?: string,
 *   coverageType?: string,
 *   hospitalCover?: string,
 *   consultantChoice?: string,
 *   dentalOptical?: string,
 *   maternityExtras?: string,
 *   dayToDayBenefits?: string,
 *   menopauseBenefit?: string,
 *   prescriptionCover?: string,
 *   physioRehab?: string,
 *   mentalHealthSupport?: string,
 *   topRecommendation?: string,
 *   topScore?: number,
 *   allRecommendations?: any[],
 *   privacyConsented?: boolean,
 *   selectedPlan?: string,
 *   userFeedback?: string,
 *   completedAt?: string (ISO datetime)
 * }
 * 
 * Returns: Updated session object
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    const body = await request.json()

    // Validate session exists
    const existingSession = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Count how many questions have been answered
    const questionsAnswered = [
      body.ageGroup,
      body.budgetRange,
      body.coverageType,
      body.hospitalCover,
      body.consultantChoice,
      body.dentalOptical,
      body.maternityExtras,
      body.dayToDayBenefits,
      body.menopauseBenefit,
      body.prescriptionCover,
      body.physioRehab,
      body.mentalHealthSupport,
    ].filter(Boolean).length

    // Prepare update data - only include fields that were provided
    const updateData: any = {
      ...body,
      questionsAnswered,
    }

    // If completedAt is provided as string, parse it
    if (body.completedAt && typeof body.completedAt === 'string') {
      updateData.completedAt = new Date(body.completedAt)
    }

    // Update session in database
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: updateData,
    })

    return NextResponse.json(updatedSession, { status: 200 })
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/sessions/:id
 * Partial update of session (only updates provided fields)
 * 
 * Same request body as PUT, but only provided fields are updated
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    const body = await request.json()

    // Validate session exists
    const existingSession = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Recalculate questionsAnswered if any quiz fields were updated
    let questionsAnswered = existingSession.questionsAnswered
    const quizFields = [
      'ageGroup',
      'budgetRange',
      'coverageType',
      'hospitalCover',
      'consultantChoice',
      'dentalOptical',
      'maternityExtras',
      'dayToDayBenefits',
      'menopauseBenefit',
      'prescriptionCover',
      'physioRehab',
      'mentalHealthSupport',
    ]

    if (quizFields.some(field => field in body)) {
      // Merge existing values with new values
      const mergedData = {
        ageGroup: body.ageGroup ?? existingSession.ageGroup,
        budgetRange: body.budgetRange ?? existingSession.budgetRange,
        coverageType: body.coverageType ?? existingSession.coverageType,
        hospitalCover: body.hospitalCover ?? existingSession.hospitalCover,
        consultantChoice: body.consultantChoice ?? existingSession.consultantChoice,
        dentalOptical: body.dentalOptical ?? existingSession.dentalOptical,
        maternityExtras: body.maternityExtras ?? existingSession.maternityExtras,
        dayToDayBenefits: body.dayToDayBenefits ?? existingSession.dayToDayBenefits,
        menopauseBenefit: body.menopauseBenefit ?? existingSession.menopauseBenefit,
        prescriptionCover: body.prescriptionCover ?? existingSession.prescriptionCover,
        physioRehab: body.physioRehab ?? existingSession.physioRehab,
        mentalHealthSupport: body.mentalHealthSupport ?? existingSession.mentalHealthSupport,
      }

      questionsAnswered = Object.values(mergedData).filter(Boolean).length
    }

    // Prepare update data
    const updateData: any = { ...body }
    if (questionsAnswered !== existingSession.questionsAnswered) {
      updateData.questionsAnswered = questionsAnswered
    }

    // If completedAt is provided as string, parse it
    if (body.completedAt && typeof body.completedAt === 'string') {
      updateData.completedAt = new Date(body.completedAt)
    }

    // Update session in database
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: updateData,
    })

    return NextResponse.json(updatedSession, { status: 200 })
  } catch (error) {
    console.error('Error patching session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}
