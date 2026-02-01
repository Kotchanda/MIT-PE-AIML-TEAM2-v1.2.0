/**
 * Post-Session Stats Panel
 * Shows question ranking changes and session insights
 * Based on MIT-PE-AIML-TEAM2 v1.2.0 blueprint
 */

'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface QuestionRank {
  question_id: string
  rank: number
  avg_info_gain: number
  dropoff_rate: number
}

interface RankDelta {
  question_id: string
  rank_change: number
}

interface PostSessionStatsPanelProps {
  topQuestions: QuestionRank[]
  bottomQuestions: QuestionRank[]
  deltas: RankDelta[]
  timeSpent: number
  questionsAnswered: number
  userSatisfied?: boolean | null
}

/**
 * Map question IDs to human-readable labels
 */
function getQuestionLabel(questionId: string): string {
  const labels: Record<string, string> = {
    Q_HOSPITAL_LEVEL: 'Hospital Level Preference',
    Q_PRICE_POSTURE: 'Budget & Price Sensitivity',
    Q_MATERNITY: 'Maternity Coverage',
    Q_MENTAL_HEALTH: 'Mental Health Services',
    Q_OVERSEAS: 'Overseas Coverage',
    Q_ROOM_TYPE: 'Room Type Preference',
    Q_EXCESS_TOLERANCE: 'Excess Tolerance',
    Q_FAMILY_SIZE: 'Family Size',
  }
  return labels[questionId] || questionId
}

export function PostSessionStatsPanel({
  topQuestions,
  bottomQuestions,
  deltas,
  timeSpent,
  questionsAnswered,
  userSatisfied,
}: PostSessionStatsPanelProps) {
  return (
    <div className="space-y-6 py-6">
      {/* Session Summary */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold mb-4">Session Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Time Spent</p>
            <p className="text-2xl font-bold">{Math.round(timeSpent / 60)}m {timeSpent % 60}s</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Questions Answered</p>
            <p className="text-2xl font-bold">{questionsAnswered}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Satisfaction</p>
            <p className="text-2xl font-bold">
              {userSatisfied === true ? '😊 Yes' : userSatisfied === false ? '😕 No' : '—'}
            </p>
          </div>
        </div>
      </Card>

      {/* Top Questions - Most Informative */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Most Informative Questions</h3>
        <p className="text-sm text-muted-foreground mb-4">
          These questions provided the most value in finding your best plan match
        </p>
        <div className="space-y-3">
          {topQuestions.map((q, idx) => (
            <div key={q.question_id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" className="bg-green-600">
                    #{idx + 1}
                  </Badge>
                  <span className="font-medium">{getQuestionLabel(q.question_id)}</span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Info Gain: {(q.avg_info_gain * 100).toFixed(0)}%</span>
                  <span>Dropoff: {(q.dropoff_rate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Question Ranking Changes */}
      {deltas.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Question Ranking Changes</h3>
          <p className="text-sm text-muted-foreground mb-4">
            How question importance has shifted since the last release
          </p>
          <div className="space-y-2">
            {deltas.map((delta) => (
              <div key={delta.question_id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <span className="font-medium text-sm">{getQuestionLabel(delta.question_id)}</span>
                <div className="flex items-center gap-2">
                  {delta.rank_change > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">↑ {delta.rank_change}</span>
                    </>
                  ) : delta.rank_change < 0 ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-600">↓ {Math.abs(delta.rank_change)}</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insights */}
      <Card className="p-6 bg-amber-50 border-amber-200">
        <h3 className="text-lg font-semibold mb-3">💡 Insights</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            • <strong>Hospital preference</strong> was the most decisive factor in your recommendations
          </li>
          <li>
            • <strong>{questionsAnswered} questions</strong> provided enough information for accurate matching
          </li>
          <li>
            • Your <strong>budget preference</strong> significantly narrowed down suitable plans
          </li>
          <li>
            • Consider reviewing <strong>specific coverage details</strong> before making a final decision
          </li>
        </ul>
      </Card>

      {/* Data Quality Notice */}
      <Card className="p-4 bg-slate-50 border-slate-200">
        <p className="text-xs text-muted-foreground">
          <strong>Data Quality:</strong> Some plans may have incomplete information marked with a
          "Verification needed" flag. We recommend checking the provider's website for the most
          current details.
        </p>
      </Card>
    </div>
  )
}
