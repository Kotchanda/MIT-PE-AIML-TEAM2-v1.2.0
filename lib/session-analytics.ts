/**
 * Session Analytics Tracker
 * Tracks anonymous user interactions for optimization
 * Based on MIT-PE-AIML-TEAM2 v1.2.0 blueprint
 */

import { v4 as uuidv4 } from 'uuid'

/**
 * Session analytics data structure
 * PRIVACY: Only stores non-identifying session metrics
 * NO personal data, NO conversation payloads, NO health details
 */
export interface SessionAnalytics {
  session_id: string
  timestamp_utc: string
  questions_asked: string[]
  answers_summary: Record<string, string>
  answered_count: number
  dropoff_question_id: string | null
  final_plans_presented: string[]
  plan_clicked: string | null
  user_satisfied: boolean | null
  time_to_recommendation_seconds: number
  presented_plan_completeness: Record<string, number>
  question_ranking_snapshot: {
    top_questions: Array<{
      question_id: string
      rank: number
      avg_info_gain: number
      dropoff_rate: number
    }>
    bottom_questions: Array<{
      question_id: string
      rank: number
      avg_info_gain: number
      dropoff_rate: number
    }>
    deltas_since_last_release: Array<{
      question_id: string
      rank_change: number
    }>
  }
}

/**
 * Session tracker class
 * Manages session lifecycle and analytics collection
 */
export class SessionTracker {
  private sessionId: string
  private startTime: number
  private questionsAsked: string[] = []
  private answersGiven: Record<string, string> = {}
  private dropoffQuestion: string | null = null
  private plansPresented: string[] = []
  private planClicked: string | null = null
  private userSatisfied: boolean | null = null

  constructor() {
    this.sessionId = uuidv4()
    this.startTime = Date.now()
  }

  /**
   * Record a question being asked
   */
  recordQuestion(questionId: string): void {
    if (!this.questionsAsked.includes(questionId)) {
      this.questionsAsked.push(questionId)
    }
  }

  /**
   * Record an answer to a question
   */
  recordAnswer(questionId: string, answer: string): void {
    this.answersGiven[questionId] = answer
  }

  /**
   * Record user dropping off at a question
   */
  recordDropoff(questionId: string): void {
    this.dropoffQuestion = questionId
  }

  /**
   * Record plans presented to user
   */
  recordPlansPresented(planIds: string[]): void {
    this.plansPresented = planIds
  }

  /**
   * Record which plan user clicked
   */
  recordPlanClicked(planId: string): void {
    this.planClicked = planId
  }

  /**
   * Record user satisfaction
   */
  recordSatisfaction(satisfied: boolean): void {
    this.userSatisfied = satisfied
  }

  /**
   * Get time elapsed since session start (in seconds)
   */
  getElapsedTime(): number {
    return Math.round((Date.now() - this.startTime) / 1000)
  }

  /**
   * Build final analytics payload
   */
  buildAnalytics(
    presentedPlanCompleteness: Record<string, number> = {},
    questionRankingSnapshot: any = null
  ): SessionAnalytics {
    return {
      session_id: this.sessionId,
      timestamp_utc: new Date().toISOString(),
      questions_asked: this.questionsAsked,
      answers_summary: this.answersGiven,
      answered_count: Object.keys(this.answersGiven).length,
      dropoff_question_id: this.dropoffQuestion,
      final_plans_presented: this.plansPresented,
      plan_clicked: this.planClicked,
      user_satisfied: this.userSatisfied,
      time_to_recommendation_seconds: this.getElapsedTime(),
      presented_plan_completeness: presentedPlanCompleteness,
      question_ranking_snapshot: questionRankingSnapshot || {
        top_questions: [],
        bottom_questions: [],
        deltas_since_last_release: [],
      },
    }
  }

  /**
   * Send analytics to backend (non-blocking)
   */
  async sendAnalytics(analytics: SessionAnalytics): Promise<void> {
    try {
      // Send to backend endpoint (implement as needed)
      // This is a placeholder - implement actual endpoint
      console.log('Analytics recorded:', {
        session_id: analytics.session_id,
        questions_asked: analytics.questions_asked.length,
        time_seconds: analytics.time_to_recommendation_seconds,
        satisfied: analytics.user_satisfied,
      })

      // Example: POST to /api/analytics
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(analytics),
      // })
    } catch (error) {
      console.error('Failed to send analytics:', error)
      // Silently fail - don't disrupt user experience
    }
  }
}

/**
 * Global session tracker instance
 */
let globalSessionTracker: SessionTracker | null = null

/**
 * Get or create global session tracker
 */
export function getSessionTracker(): SessionTracker {
  if (!globalSessionTracker) {
    globalSessionTracker = new SessionTracker()
  }
  return globalSessionTracker
}

/**
 * Reset session tracker (for new session)
 */
export function resetSessionTracker(): void {
  globalSessionTracker = new SessionTracker()
}

/**
 * Mock question ranking data (for post-session stats panel)
 * In production, this would come from aggregated analytics
 */
export function getMockQuestionRankingSnapshot() {
  return {
    top_questions: [
      {
        question_id: 'Q_HOSPITAL_LEVEL',
        rank: 1,
        avg_info_gain: 0.65,
        dropoff_rate: 0.05,
      },
      {
        question_id: 'Q_PRICE_POSTURE',
        rank: 2,
        avg_info_gain: 0.48,
        dropoff_rate: 0.06,
      },
      {
        question_id: 'Q_MATERNITY',
        rank: 3,
        avg_info_gain: 0.41,
        dropoff_rate: 0.07,
      },
    ],
    bottom_questions: [
      {
        question_id: 'Q_EXCESS_TOLERANCE',
        rank: 8,
        avg_info_gain: 0.1,
        dropoff_rate: 0.18,
      },
    ],
    deltas_since_last_release: [
      {
        question_id: 'Q_MATERNITY',
        rank_change: 2,
      },
      {
        question_id: 'Q_MENTAL_HEALTH',
        rank_change: -1,
      },
    ],
  }
}
