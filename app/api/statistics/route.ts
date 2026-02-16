/**
 * Statistics API Routes
 * 
 * GET /api/statistics - Retrieve aggregated session statistics
 * POST /api/statistics - Calculate and store new statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/statistics
 * Retrieve aggregated statistics about user sessions and recommendations
 * 
 * Query params:
 * - days?: number (retrieve stats from last N days, default: 30)
 * 
 * Returns: Statistics object with aggregated data
 */
export async function GET(request: NextRequest) {
  try {
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get all completed sessions in the time period
    const completedSessions = await prisma.session.findMany({
      where: {
        completedAt: {
          gte: startDate,
        },
      },
    })

    // Get all sessions (including abandoned) in the time period
    const allSessions = await prisma.session.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    })

    // Calculate statistics
    const totalSessions = allSessions.length
    const completedCount = completedSessions.length
    const abandonedCount = totalSessions - completedCount

    // Calculate average time to choice
    const timesToChoice = completedSessions
      .filter(s => s.timeToChoice !== null)
      .map(s => s.timeToChoice as number)
    const avgTimeToChoice = timesToChoice.length > 0
      ? timesToChoice.reduce((a, b) => a + b, 0) / timesToChoice.length
      : null

    // Calculate average questions answered
    const avgQuestionsAnswered = completedCount > 0
      ? completedSessions.reduce((sum, s) => sum + s.questionsAnswered, 0) / completedCount
      : null

    // Find most selected plan
    const planSelections = completedSessions
      .filter(s => s.selectedPlan !== null)
      .reduce((acc: Record<string, number>, s) => {
        const planId = s.selectedPlan!
        acc[planId] = (acc[planId] || 0) + 1
        return acc
      }, {})

    const mostSelectedPlan = Object.entries(planSelections).length > 0
      ? Object.entries(planSelections).sort(([, a], [, b]) => b - a)[0][0]
      : null

    // Find most selected provider
    const providerSelections = completedSessions
      .filter(s => s.topRecommendation !== null)
      .reduce((acc: Record<string, number>, s) => {
        // This would need plan data to get provider - simplified for now
        acc[s.topRecommendation!] = (acc[s.topRecommendation!] || 0) + 1
        return acc
      }, {})

    const mostSelectedProvider = Object.entries(providerSelections).length > 0
      ? Object.entries(providerSelections).sort(([, a], [, b]) => b - a)[0][0]
      : null

    // Find most common age group
    const ageGroups = completedSessions
      .filter(s => s.ageGroup !== null)
      .reduce((acc: Record<string, number>, s) => {
        const age = s.ageGroup!
        acc[age] = (acc[age] || 0) + 1
        return acc
      }, {})

    const topAgeGroup = Object.entries(ageGroups).length > 0
      ? Object.entries(ageGroups).sort(([, a], [, b]) => b - a)[0][0]
      : null

    // Find most common budget range
    const budgetRanges = completedSessions
      .filter(s => s.budgetRange !== null)
      .reduce((acc: Record<string, number>, s) => {
        const budget = s.budgetRange!
        acc[budget] = (acc[budget] || 0) + 1
        return acc
      }, {})

    const topBudgetRange = Object.entries(budgetRanges).length > 0
      ? Object.entries(budgetRanges).sort(([, a], [, b]) => b - a)[0][0]
      : null

    // Calculate average top score
    const topScores = completedSessions
      .filter(s => s.topScore !== null)
      .map(s => s.topScore as number)
    const avgTopScore = topScores.length > 0
      ? topScores.reduce((a, b) => a + b, 0) / topScores.length
      : null

    // Calculate recommendation accuracy (users who selected top recommendation)
    const selectedTopRecommendation = completedSessions.filter(
      s => s.selectedPlan === s.topRecommendation
    ).length
    const recommendationAccuracy = completedCount > 0
      ? (selectedTopRecommendation / completedCount) * 100
      : null

    return NextResponse.json(
      {
        period: {
          days,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
        },
        sessions: {
          total: totalSessions,
          completed: completedCount,
          abandoned: abandonedCount,
          completionRate: totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0,
        },
        metrics: {
          avgTimeToChoice,
          avgQuestionsAnswered,
          avgTopScore,
          recommendationAccuracy,
        },
        popular: {
          mostSelectedPlan,
          mostSelectedProvider,
          topAgeGroup,
          topBudgetRange,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error retrieving statistics:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve statistics' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/statistics
 * Calculate and store aggregated statistics (typically called by a cron job)
 * 
 * Returns: Created statistics record
 */
export async function POST(request: NextRequest) {
  try {
    // Get stats from last 30 days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const completedSessions = await prisma.session.findMany({
      where: {
        completedAt: {
          gte: startDate,
        },
      },
    })

    const allSessions = await prisma.session.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    })

    // Calculate metrics (same as GET endpoint)
    const totalSessions = allSessions.length
    const completedCount = completedSessions.length
    const abandonedCount = totalSessions - completedCount

    const timesToChoice = completedSessions
      .filter(s => s.timeToChoice !== null)
      .map(s => s.timeToChoice as number)
    const avgTimeToChoice = timesToChoice.length > 0
      ? timesToChoice.reduce((a, b) => a + b, 0) / timesToChoice.length
      : null

    const avgQuestionsAnswered = completedCount > 0
      ? completedSessions.reduce((sum, s) => sum + s.questionsAnswered, 0) / completedCount
      : null

    const topScores = completedSessions
      .filter(s => s.topScore !== null)
      .map(s => s.topScore as number)
    const avgTopScore = topScores.length > 0
      ? topScores.reduce((a, b) => a + b, 0) / topScores.length
      : null

    const selectedTopRecommendation = completedSessions.filter(
      s => s.selectedPlan === s.topRecommendation
    ).length
    const recommendationAccuracy = completedCount > 0
      ? (selectedTopRecommendation / completedCount) * 100
      : null

    // Find most selected plan
    const planSelections = completedSessions
      .filter(s => s.selectedPlan !== null)
      .reduce((acc: Record<string, number>, s) => {
        const planId = s.selectedPlan!
        acc[planId] = (acc[planId] || 0) + 1
        return acc
      }, {})
    const mostSelectedPlan = Object.entries(planSelections).length > 0
      ? Object.entries(planSelections).sort(([, a], [, b]) => b - a)[0][0]
      : null

    // Find most common age group
    const ageGroups = completedSessions
      .filter(s => s.ageGroup !== null)
      .reduce((acc: Record<string, number>, s) => {
        const age = s.ageGroup!
        acc[age] = (acc[age] || 0) + 1
        return acc
      }, {})
    const topAgeGroup = Object.entries(ageGroups).length > 0
      ? Object.entries(ageGroups).sort(([, a], [, b]) => b - a)[0][0]
      : null

    // Find most common budget range
    const budgetRanges = completedSessions
      .filter(s => s.budgetRange !== null)
      .reduce((acc: Record<string, number>, s) => {
        const budget = s.budgetRange!
        acc[budget] = (acc[budget] || 0) + 1
        return acc
      }, {})
    const topBudgetRange = Object.entries(budgetRanges).length > 0
      ? Object.entries(budgetRanges).sort(([, a], [, b]) => b - a)[0][0]
      : null

    // Store statistics in database
    const stats = await prisma.statistics.create({
      data: {
        totalSessions,
        completedSessions: completedCount,
        abandonedSessions: abandonedCount,
        avgTimeToChoice,
        avgQuestionsAnswered,
        mostSelectedPlan,
        topAgeGroup,
        topBudgetRange,
        avgTopScore,
        recommendationAccuracy,
      },
    })

    return NextResponse.json(stats, { status: 201 })
  } catch (error) {
    console.error('Error creating statistics:', error)
    return NextResponse.json(
      { error: 'Failed to create statistics' },
      { status: 500 }
    )
  }
}
