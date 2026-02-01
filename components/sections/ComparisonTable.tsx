/**
 * Comparison Table Component
 * Displays all plans in a detailed comparison table
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, X } from 'lucide-react'
import { getAllPlans, getProvider } from '@/lib/insurance-data'

export default function ComparisonTable() {
  const [selectedTier, setSelectedTier] = useState<'all' | 'basic' | 'standard' | 'premium'>('all')
  const allPlans = getAllPlans()

  // Filter plans by tier
  const filteredPlans = selectedTier === 'all'
    ? allPlans
    : allPlans.filter(p => p.tier === selectedTier)

  // Group plans by provider
  const plansByProvider = filteredPlans.reduce((acc, plan) => {
    const provider = getProvider(plan.providerId)
    if (!provider) return acc
    if (!acc[provider.name]) {
      acc[provider.name] = []
    }
    acc[provider.name].push(plan)
    return acc
  }, {} as Record<string, typeof filteredPlans>)

  return (
    <div className="space-y-6">
      {/* Tier Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Plan Tier</CardTitle>
          <CardDescription>
            View plans by coverage level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTier} onValueChange={(v) => setSelectedTier(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Plans</TabsTrigger>
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="premium">Premium</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Plans by Provider */}
      {Object.entries(plansByProvider).map(([providerName, plans]) => (
        <Card key={providerName}>
          <CardHeader>
            <CardTitle>{providerName}</CardTitle>
            <CardDescription>
              {plans.length} plan{plans.length !== 1 ? 's' : ''} available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {plans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">{plan.name}</h4>
                      <Badge className="mt-2" variant="outline">
                        {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid gap-4 md:grid-cols-3 mb-4 p-3 bg-slate-50 rounded">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Adult Price</p>
                      <p className="text-2xl font-bold text-slate-900">€{plan.adultPrice}</p>
                      <p className="text-xs text-slate-500">/year</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Child Price</p>
                      <p className="text-2xl font-bold text-slate-900">€{plan.childPrice}</p>
                      <p className="text-xs text-slate-500">/year</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Family Price</p>
                      <p className="text-2xl font-bold text-slate-900">€{plan.familyPrice}</p>
                      <p className="text-xs text-slate-500">/year</p>
                    </div>
                  </div>

                  {/* Coverage Grid */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Coverage Included</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {Object.entries(plan.coverage).map(([key, included]) => (
                        <div key={key} className="flex items-center gap-2">
                          {included ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-slate-300 flex-shrink-0" />
                          )}
                          <span className={included ? 'text-slate-900' : 'text-slate-400'}>
                            {key === 'dayPatient' ? 'Day Patient' : key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Details */}
                  <div className="grid gap-3 md:grid-cols-3 mb-4 text-sm">
                    <div>
                      <p className="text-slate-600 mb-1">Excess</p>
                      <p className="font-semibold text-slate-900">
                        {plan.excess === 0 ? 'None' : `€${plan.excess}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Waiting Period</p>
                      <p className="font-semibold text-slate-900">
                        {plan.waitingPeriod === 0 ? 'None' : `${plan.waitingPeriod} months`}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Hospital Network</p>
                      <p className="font-semibold text-slate-900">
                        {plan.hospitalNetwork.length} hospitals
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-slate-900 mb-2">Key Features</p>
                    <ul className="space-y-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-green-600 font-bold mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Hospital Network */}
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-semibold text-slate-900 mb-2">Hospital Network</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.hospitalNetwork.map((hospital, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {hospital}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Button className="w-full" asChild>
                    <a
                      href={getProvider(plan.providerId)?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get Quote for {plan.name}
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Price Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price Comparison by Tier</CardTitle>
          <CardDescription>
            Average adult annual premiums by plan tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['basic', 'standard', 'premium'].map((tier) => {
              const tierPlans = allPlans.filter(p => p.tier === tier)
              const avgPrice = Math.round(
                tierPlans.reduce((sum, p) => sum + p.adultPrice, 0) / tierPlans.length
              )
              const minPrice = Math.min(...tierPlans.map(p => p.adultPrice))
              const maxPrice = Math.max(...tierPlans.map(p => p.adultPrice))

              return (
                <div key={tier}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900 capitalize">{tier} Plans</p>
                    <p className="text-sm text-slate-600">
                      €{minPrice} - €{maxPrice}
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${((avgPrice - minPrice) / (maxPrice - minPrice)) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Average: €{avgPrice}/year</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
