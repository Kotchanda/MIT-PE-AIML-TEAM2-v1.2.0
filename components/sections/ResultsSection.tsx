/**
 * Results Section - Display Top 5 Recommendations
 * Shows recommendations from engine v3 with explanations and verification flags
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, ExternalLink, TrendingUp } from 'lucide-react'
import type { ComparisonResult } from '@/lib/types'

interface ResultsSectionProps {
  results: ComparisonResult[]
  stats: any
  onComplete: () => void
  onRestart: () => void
}

export function ResultsSection({
  results,
  stats,
  onComplete,
  onRestart,
}: ResultsSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(results[0]?.plan.plan_id)

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Results header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Top Recommendations</h2>
        <p className="text-gray-600">
          Based on your preferences, here are the {results.length} best-matched insurance plans
        </p>
      </div>

      {/* Results summary stats */}
      {stats && (
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Plans Analyzed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalPlans}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Completeness</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avgCompleteness}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Insurer</p>
              <p className="text-2xl font-bold text-blue-600">
                {Object.entries(stats.byInsurer).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plans Matched</p>
              <p className="text-2xl font-bold text-blue-600">{results.length}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations list */}
      <div className="space-y-4 mb-8">
        {results.map((result, index) => (
          <Card
            key={result.plan.plan_id}
            className={`p-6 cursor-pointer transition-all ${
              expandedPlan === result.plan.plan_id
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => setExpandedPlan(expandedPlan === result.plan.plan_id ? null : result.plan.plan_id)}
          >
            {/* Plan header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-blue-600">#{index + 1}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {result.plan.plan_name}
                    </h3>
                    <p className="text-sm text-gray-600">{result.plan.insurer}</p>
                  </div>
                </div>
              </div>

              {/* Match score */}
              <div className="text-right">
                <div className="text-4xl font-bold text-green-600">{result.score}%</div>
                <p className="text-sm text-gray-600">Match Score</p>
              </div>
            </div>

            {/* Plan tier and badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">{result.plan.plan_tier}</Badge>
              {result.completenessScore === 1.0 && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Fully Verified
                </Badge>
              )}
              {result.verificationNeeded && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Verify Details
                </Badge>
              )}
            </div>

            {/* Top drivers (key reasons for recommendation) */}
            {result.drivers.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">Why this plan matches:</p>
                <ul className="space-y-1">
                  {result.drivers.map((driver) => (
                    <li key={driver.feature} className="text-sm text-gray-600">
                      <span className="font-medium capitalize">
                        {driver.feature.replace(/_/g, ' ')}
                      </span>
                      : +{driver.points} points
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expanded details */}
            {expandedPlan === result.plan.plan_id && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {/* Coverage details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Coverage Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Hospital Cover', value: result.plan.hospital_cover },
                      { label: 'Outpatient', value: result.plan.outpatient_cover },
                      { label: 'GP Visits', value: result.plan.gp_visits },
                      { label: 'Maternity', value: result.plan.maternity_cover },
                      { label: 'Mental Health', value: result.plan.mental_health },
                      { label: 'Overseas Emergency', value: result.plan.overseas_emergency },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center gap-2">
                        {value === true ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : value === false ? (
                          <div className="w-4 h-4 rounded-full border-2 border-red-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
                        )}
                        <span className="text-sm text-gray-700">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification flags */}
                {result.verificationFlags.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">
                      ⚠️ Verification Needed:
                    </p>
                    <ul className="space-y-1">
                      {result.verificationFlags.map((flag) => (
                        <li key={flag} className="text-sm text-yellow-800">
                          • {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Trade-offs */}
                {result.tradeOffs && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <TrendingUp className="w-4 h-4 inline mr-2" />
                      {result.tradeOffs}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-4">
                  {result.sourceUrl && (
                    <a
                      href={result.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Full Details
                      </Button>
                    </a>
                  )}
                  <Button
                    onClick={() => setSelectedPlan(result.plan.plan_id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Select This Plan
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Bottom action buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onRestart}
          className="flex-1"
        >
          ← Start Over
        </Button>
        <Button
          onClick={onComplete}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          View Statistics →
        </Button>
      </div>

      {/* Selected plan confirmation */}
      {selectedPlan && (
        <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-green-900 mb-2">Plan Selected!</h3>
          <p className="text-green-800 mb-4">
            You've selected{' '}
            <strong>
              {results.find((r) => r.plan.plan_id === selectedPlan)?.plan.plan_name}
            </strong>
          </p>
          <p className="text-sm text-green-700">
            Next step: Contact the insurer to complete your application
          </p>
        </div>
      )}
    </div>
  )
}
