/**
 * Plans API Routes
 * 
 * GET /api/plans - Retrieve all active plans
 * POST /api/plans - Create a new plan (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/plans
 * Retrieve all active health insurance plans
 * 
 * Query params:
 * - provider?: string (filter by provider: VHI, Laya, Irish Life Health, Level Health)
 * - planType?: string (filter by plan type: basic, standard, comprehensive)
 * - maxPrice?: number (filter by maximum monthly premium)
 * 
 * Returns: Array of plan objects
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters for filtering
    const provider = request.nextUrl.searchParams.get('provider')
    const planType = request.nextUrl.searchParams.get('planType')
    const maxPrice = request.nextUrl.searchParams.get('maxPrice')

    // Build filter conditions
    const where: any = {
      isActive: true,
    }

    if (provider) {
      where.provider = provider
    }

    if (planType) {
      where.planType = planType
    }

    if (maxPrice) {
      where.monthlyPremium = {
        lte: parseFloat(maxPrice),
      }
    }

    // Retrieve plans from database
    const plans = await prisma.plan.findMany({
      where,
      orderBy: [
        { provider: 'asc' },
        { monthlyPremium: 'asc' },
      ],
    })

    return NextResponse.json(plans, { status: 200 })
  } catch (error) {
    console.error('Error retrieving plans:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve plans' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/plans
 * Create a new health insurance plan (admin only)
 * 
 * Request body: Plan object with all required fields
 * 
 * Returns: Created plan object
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'provider', 'planType', 'monthlyPremium', 'annualPremium']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create plan in database
    const plan = await prisma.plan.create({
      data: body,
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    )
  }
}
