/**
 * Provider Overview Component
 * Displays information about all health insurance providers
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Users, TrendingUp } from 'lucide-react'
import { getAllProviders } from '@/lib/insurance-data'

export default function ProviderOverview() {
  const providers = getAllProviders()

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {providers.map((provider) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <CardTitle className="text-xl">{provider.name}</CardTitle>
                  <CardDescription>{provider.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Stats */}
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-600">Market Share</p>
                    <p className="font-semibold text-slate-900">{provider.marketShare}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-slate-600">Customer Base</p>
                    <p className="font-semibold text-slate-900">{provider.customerBase}</p>
                  </div>
                </div>
              </div>

              {/* Founded */}
              <div className="border-t pt-3">
                <p className="text-xs text-slate-600 mb-1">Founded</p>
                <p className="font-semibold text-slate-900">{provider.founded}</p>
              </div>

              {/* Contact */}
              <div className="border-t pt-3">
                <p className="text-xs text-slate-600 mb-2">Contact</p>
                <p className="font-mono text-sm text-slate-900 mb-3">{provider.phone}</p>
                <Button className="w-full gap-2" asChild>
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              {/* Badge */}
              <div className="flex gap-2 flex-wrap">
                {provider.id === 'vhi' && (
                  <Badge className="bg-blue-600">Market Leader</Badge>
                )}
                {provider.id === 'level' && (
                  <Badge className="bg-purple-600">New Entrant 2024</Badge>
                )}
                {provider.id === 'laya' && (
                  <Badge className="bg-green-600">Fast Growing</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Summary */}
      <Card className="bg-gradient-to-br from-slate-50 to-white">
        <CardHeader>
          <CardTitle>Provider Comparison</CardTitle>
          <CardDescription>
            Key differences between Irish health insurance providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold">Provider</th>
                  <th className="text-center py-3 px-4 font-semibold">Market Share</th>
                  <th className="text-center py-3 px-4 font-semibold">Plans</th>
                  <th className="text-center py-3 px-4 font-semibold">Strength</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">VHI Healthcare</td>
                  <td className="text-center py-3 px-4">48.4%</td>
                  <td className="text-center py-3 px-4">Multiple</td>
                  <td className="text-center py-3 px-4">
                    <Badge variant="secondary">Largest Network</Badge>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">Laya Healthcare</td>
                  <td className="text-center py-3 px-4">28.4%</td>
                  <td className="text-center py-3 px-4">Multiple</td>
                  <td className="text-center py-3 px-4">
                    <Badge variant="secondary">Competitive Pricing</Badge>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">Irish Life Health</td>
                  <td className="text-center py-3 px-4">20.4%</td>
                  <td className="text-center py-3 px-4">Multiple</td>
                  <td className="text-center py-3 px-4">
                    <Badge variant="secondary">Integrated Services</Badge>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">Level Health</td>
                  <td className="text-center py-3 px-4">2.6%</td>
                  <td className="text-center py-3 px-4">4 Simple Plans</td>
                  <td className="text-center py-3 px-4">
                    <Badge variant="secondary">Simplicity</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Facts */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Key Facts About Irish Health Insurance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <p className="text-sm text-slate-700">
              <strong>Community Rating:</strong> All providers use the same pricing model based on age, not health status
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <p className="text-sm text-slate-700">
              <strong>Tax Relief:</strong> You can claim tax relief on health insurance premiums (up to 20% for standard rate)
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <p className="text-sm text-slate-700">
              <strong>No Waiting Periods:</strong> Switchers from existing cover typically have no waiting periods
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <p className="text-sm text-slate-700">
              <strong>Direct Debit:</strong> All providers accept Direct Debit payment for convenience
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <p className="text-sm text-slate-700">
              <strong>Hospital Network:</strong> Each provider has partnerships with private hospitals across Ireland
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
