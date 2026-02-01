/**
 * Recommendation Results Component
 * Displays personalized recommendations based on user preferences
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, AlertCircle, ExternalLink, TrendingUp } from 'lucide-react'
import type { ComparisonResult, UserPreferences } from '@/lib/types'

interface RecommendationResultsProps {
  recommendations: ComparisonResult[]
  preferences: UserPreferences
}

export default function RecommendationResults({
  recommendations,
  preferences,
}: RecommendationResultsProps) {
  // Get top 3 recommendations
  const topRecommendations = recommendations.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Top Recommendation */}
      {topRecommendations.length > 0 && (
        <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Badge className="mb-2 bg-green-600">Top Recommendation</Badge>
                <CardTitle className="text-2xl">
                  {topRecommendations[0].plan.name}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {topRecommendations[0].provider.name}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-600">
                  {topRecommendations[0].matchPercentage}%
                </div>
                <p className="text-sm text-slate-600">Match Score</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Why This Plan?</h4>
                <ul className="space-y-2">
                  {topRecommendations[0].reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-1">Estimated Annual Cost</p>
                  <p className="text-3xl font-bold text-slate-900">
                    €{topRecommendations[0].estimatedAnnualCost}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Based on your family composition
                  </p>
                </div>
                <Button className="w-full gap-2" asChild>
                  <a
                    href={topRecommendations[0].provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get Quote <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Coverage Details */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-slate-900 mb-4">Coverage Included</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(topRecommendations[0].plan.coverage).map(([key, included]) => (
                  <div key={key} className="flex items-center gap-2">
                    {included ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-slate-300" />
                    )}
                    <span className={included ? 'text-slate-900' : 'text-slate-400'}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Features */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-slate-900 mb-4">Key Features</h4>
              <ul className="space-y-2">
                {topRecommendations[0].plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Recommendations */}
      {topRecommendations.length > 1 && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Other Great Options</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {topRecommendations.slice(1).map((rec, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{rec.plan.name}</CardTitle>
                      <CardDescription>{rec.provider.name}</CardDescription>
                    </div>
                    <Badge variant="outline">{rec.matchPercentage}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Annual Cost</p>
                    <p className="text-2xl font-bold">€{rec.estimatedAnnualCost}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-2">Why Consider This?</p>
                    <ul className="space-y-1">
                      {rec.reasons.slice(0, 2).map((reason, ridx) => (
                        <li key={ridx} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <a
                      href={rec.provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn More <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Recommendations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Recommendations</CardTitle>
          <CardDescription>
            Complete ranking of all plans based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold">Provider</th>
                  <th className="text-right py-3 px-4 font-semibold">Match</th>
                  <th className="text-right py-3 px-4 font-semibold">Annual Cost</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((rec, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{rec.plan.name}</p>
                        <p className="text-xs text-slate-500">{rec.plan.tier}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{rec.provider.name}</td>
                    <td className="text-right py-3 px-4">
                      <Badge variant="secondary">{rec.matchPercentage}%</Badge>
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      €{rec.estimatedAnnualCost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-700">
            Ready to get a quote? Here's what to do:
          </p>
          <ol className="space-y-2 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">1.</span>
              <span>Click "Get Quote" on your top recommendation</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">2.</span>
              <span>Enter your details on the provider's website</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">3.</span>
              <span>Compare quotes from multiple providers</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">4.</span>
              <span>Check for any available discounts or promotions</span>
            </li>
          </ol>
          <p className="text-xs text-slate-600 mt-4">
            💡 Tip: All providers offer Direct Debit payment options. Some brokers like Total Health can help you save €500+ on family plans.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
