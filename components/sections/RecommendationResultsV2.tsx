/**
 * Enhanced Recommendation Results Component
 * Displays recommendations with match scores, verification flags, and explainability
 * Based on MIT-PE-AIML-TEAM2 v1.2.0 blueprint
 */

'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'
import type { ComparisonResult } from '@/lib/types'

interface RecommendationResultsV2Props {
  results: ComparisonResult[]
  onSelectPlan?: (planId: string) => void
}

/**
 * Format currency to EUR
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get color for match percentage
 */
function getMatchColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-100 text-green-900'
  if (percentage >= 60) return 'bg-blue-100 text-blue-900'
  if (percentage >= 40) return 'bg-amber-100 text-amber-900'
  return 'bg-red-100 text-red-900'
}

/**
 * Get badge color for completeness score
 */
function getCompletenessColor(score: number): string {
  if (score >= 0.8) return 'bg-green-100 text-green-800'
  if (score >= 0.6) return 'bg-blue-100 text-blue-800'
  return 'bg-amber-100 text-amber-800'
}

export function RecommendationResultsV2({ results, onSelectPlan }: RecommendationResultsV2Props) {
  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No recommendations found. Please adjust your preferences and try again.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Personalized Recommendations</h2>
        <p className="text-muted-foreground">
          Plans ranked by match to your needs and budget. {results.length} plan
          {results.length !== 1 ? 's' : ''} found.
        </p>
      </div>

      {/* Results */}
      {results.map((result, index) => (
        <Card key={result.plan.id} className="p-6 hover:shadow-lg transition-shadow">
          {/* Header with rank and match score */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 font-bold">
                #{index + 1}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{result.plan.name}</h3>
                <p className="text-sm text-muted-foreground">{result.provider.name}</p>
              </div>
            </div>

            {/* Match percentage badge */}
            <div className={`px-4 py-2 rounded-lg font-bold text-lg ${getMatchColor(result.matchPercentage)}`}>
              {result.matchPercentage}% Match
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Cost</p>
              <p className="text-2xl font-bold">{formatCurrency(result.estimatedAnnualCost)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Plan Tier</p>
              <Badge variant="outline" className="mt-1">
                {result.plan.tier}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Data Quality</p>
              <Badge className={`mt-1 ${getCompletenessColor(result.completenessScore || 0)}`}>
                {((result.completenessScore || 0) * 100).toFixed(0)}% Complete
              </Badge>
            </div>
          </div>

          {/* Why this plan matches */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Why this plan matches your needs
            </h4>
            <ul className="space-y-1">
              {result.reasons.map((reason, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Verification flag if needed */}
          {result.needsVerification && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <strong>Verification needed:</strong> Some coverage details are incomplete. We recommend
                checking the provider's website for the most current information.
              </div>
            </div>
          )}

          {/* Coverage highlights */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2">Coverage Highlights</h4>
            <div className="grid grid-cols-2 gap-2">
              {result.plan.outpatientCover && (
                <Badge variant="secondary" className="justify-start">
                  ✓ Outpatient Cover
                </Badge>
              )}
              {result.plan.gpVisits && (
                <Badge variant="secondary" className="justify-start">
                  ✓ GP Visits
                </Badge>
              )}
              {result.plan.mentalHealthCover && (
                <Badge variant="secondary" className="justify-start">
                  ✓ Mental Health
                </Badge>
              )}
              {result.plan.overseasEmergency && (
                <Badge variant="secondary" className="justify-start">
                  ✓ Overseas Emergency
                </Badge>
              )}
              {result.plan.maternityIncluded && (
                <Badge variant="secondary" className="justify-start">
                  ✓ Maternity
                </Badge>
              )}
              {result.plan.privateRoom && (
                <Badge variant="secondary" className="justify-start">
                  ✓ Private Room
                </Badge>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => onSelectPlan?.(result.plan.id)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Get Quote for {result.plan.name}
          </Button>
        </Card>
      ))}

      {/* Disclaimer */}
      <Card className="p-4 bg-slate-50 border-slate-200">
        <p className="text-xs text-muted-foreground">
          <strong>Disclaimer:</strong> These recommendations are based on your stated preferences and
          publicly available plan information. Please review the full terms and conditions on the
          provider's website before making a final decision. Prices and coverage may change.
        </p>
      </Card>
    </div>
  )
}
