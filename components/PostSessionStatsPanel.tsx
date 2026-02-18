/**
 * Post-Session Stats Panel with Detailed Explanations
 * Shows aggregated metrics and insights after user completes quiz
 * Based on MIT-PE-AIML-TEAM2 v1.2.0 blueprint
 * 
 * ENHANCED: Each statistic includes detailed explanation tooltips
 * explaining what the metric means and why it matters
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { RotateCcw, Download, Share2, Info } from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PostSessionStatsPanelProps {
  stats: any
  onRestart: () => void
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

/**
 * Detailed explanations for each statistic
 * These help users understand what each metric means and why it matters
 */
const STAT_EXPLANATIONS = {
  totalPlans: {
    title: 'Total Plans Analyzed',
    explanation: 'The complete dataset of health insurance plans we analyzed to find your best matches. This includes all plans from VHI, Laya Healthcare, Irish Life Health, and Level Health currently available in the Irish market.',
    whatItMeans: 'More plans = more options and better chance of finding your perfect match',
    whyItMatters: 'A comprehensive dataset ensures we\'re comparing all available options, not just a subset. This gives you confidence that your recommendations are based on the full market.',
  },
  avgCompleteness: {
    title: 'Average Data Completeness Score',
    explanation: 'Measures how complete and verified the plan data is. A score of 100% means all key fields (hospital cover, day-to-day benefits, pricing, etc.) are filled in and verified. Lower scores indicate some fields are missing or unverified.',
    whatItMeans: 'Higher completeness = more reliable recommendations',
    whyItMatters: 'Insurance plans with missing data may not be accurately compared. We track completeness to flag plans that need verification before you make a final decision.',
  },
  insurerCount: {
    title: 'Number of Insurers',
    explanation: 'The count of major health insurance providers represented in our dataset. Currently includes: VHI (market leader), Laya Healthcare (competitive pricing), Irish Life Health (tailored plans), and Level Health (new entrant with simple plans).',
    whatItMeans: 'More insurers = more competition and better pricing',
    whyItMatters: 'Having multiple insurers ensures you\'re not locked into one provider\'s offerings. Competition drives better features and pricing.',
  },
  mostCommonTier: {
    title: 'Most Common Plan Tier',
    explanation: 'The plan tier (BASIC, MID, HIGH, PREMIUM) that appears most frequently in the market. This shows what most customers are choosing.',
    whatItMeans: 'Popular tiers often offer the best value for money',
    whyItMatters: 'If most customers choose MID-tier plans, it suggests that tier offers good balance between cost and coverage.',
  },
  largestInsurer: {
    title: 'Largest Insurer by Plan Count',
    explanation: 'The insurer with the most plans in our dataset. More plans from one insurer means more options and customization within that provider.',
    whatItMeans: 'More plans = more flexibility to find your exact needs',
    whyItMatters: 'Insurers with more plans offer greater customization. You can fine-tune coverage to match your specific requirements.',
  },
  byInsurer: {
    title: 'Plans by Insurer',
    explanation: 'Breakdown of how many plans each insurer offers. VHI typically has the most plans (market leader), while newer entrants like Level Health have fewer but more focused options.',
    whatItMeans: 'Shows market share and insurer strategy',
    whyItMatters: 'Established insurers (VHI) offer breadth; newer insurers (Level) offer simplicity. Choose based on your preference.',
  },
  byTier: {
    title: 'Plans by Tier',
    explanation: 'Distribution of plans across tiers: BASIC (lowest cost, essential cover), MID (balanced), HIGH (comprehensive), PREMIUM (maximum coverage). Shows what the market offers at each price point.',
    whatItMeans: 'Shows the range of options from budget to premium',
    whyItMatters: 'Helps you understand what\'s available at your budget level and what you\'d get if you spent more.',
  },
}

export function PostSessionStatsPanel({ stats, onRestart }: PostSessionStatsPanelProps) {
  const [expandedStat, setExpandedStat] = useState<string | null>(null)

  if (!stats) {
    return null
  }

  // Prepare data for charts - with defensive checks for missing properties
  const insurerData = stats.byInsurer ? Object.entries(stats.byInsurer).map(([name, count]) => ({
    name,
    count,
  })) : []

  const tierData = stats.byTier ? Object.entries(stats.byTier).map(([name, count]) => ({
    name,
    count,
  })) : []

  // Get most common tier and largest insurer with defensive checks
  const mostCommonTier = stats.byTier ? Object.entries(stats.byTier).sort(([, a], [, b]) => b - a)[0]?.[0] : 'N/A'
  const largestInsurer = stats.byInsurer ? Object.entries(stats.byInsurer).sort(([, a], [, b]) => b - a)[0]?.[0] : 'N/A'

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Session Analytics</h1>
        <p className="text-lg text-gray-600">
          Comprehensive insights from analyzing {stats.totalPlans} insurance plans
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* Total Plans */}
        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setExpandedStat(expandedStat === 'totalPlans' ? null : 'totalPlans')}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Plans Analyzed</p>
              <p className="text-4xl font-bold text-blue-900">{stats.totalPlans}</p>
            </div>
            <Info className="w-5 h-5 text-blue-500" />
          </div>
          {expandedStat === 'totalPlans' && (
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <p>{STAT_EXPLANATIONS.totalPlans.explanation}</p>
              <p><strong>What it means:</strong> {STAT_EXPLANATIONS.totalPlans.whatItMeans}</p>
              <p><strong>Why it matters:</strong> {STAT_EXPLANATIONS.totalPlans.whyItMatters}</p>
            </div>
          )}
        </Card>

        {/* Average Completeness */}
        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setExpandedStat(expandedStat === 'avgCompleteness' ? null : 'avgCompleteness')}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Avg. Data Completeness</p>
              <p className="text-4xl font-bold text-green-900">{stats.avgCompleteness}%</p>
            </div>
            <Info className="w-5 h-5 text-green-500" />
          </div>
          {expandedStat === 'avgCompleteness' && (
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <p>{STAT_EXPLANATIONS.avgCompleteness.explanation}</p>
              <p><strong>What it means:</strong> {STAT_EXPLANATIONS.avgCompleteness.whatItMeans}</p>
              <p><strong>Why it matters:</strong> {STAT_EXPLANATIONS.avgCompleteness.whyItMatters}</p>
            </div>
          )}
        </Card>

        {/* Insurer Count */}
        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setExpandedStat(expandedStat === 'insurerCount' ? null : 'insurerCount')}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Number of Insurers</p>
              <p className="text-4xl font-bold text-purple-900">{stats.insurerCount || Object.keys(stats.byInsurer || {}).length}</p>
            </div>
            <Info className="w-5 h-5 text-purple-500" />
          </div>
          {expandedStat === 'insurerCount' && (
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <p>{STAT_EXPLANATIONS.insurerCount.explanation}</p>
              <p><strong>What it means:</strong> {STAT_EXPLANATIONS.insurerCount.whatItMeans}</p>
              <p><strong>Why it matters:</strong> {STAT_EXPLANATIONS.insurerCount.whyItMatters}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Most Common Tier */}
        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setExpandedStat(expandedStat === 'mostCommonTier' ? null : 'mostCommonTier')}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Most Common Plan Tier</p>
              <p className="text-3xl font-bold text-orange-900">{mostCommonTier}</p>
            </div>
            <Info className="w-5 h-5 text-orange-500" />
          </div>
          {expandedStat === 'mostCommonTier' && (
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <p>{STAT_EXPLANATIONS.mostCommonTier.explanation}</p>
              <p><strong>What it means:</strong> {STAT_EXPLANATIONS.mostCommonTier.whatItMeans}</p>
              <p><strong>Why it matters:</strong> {STAT_EXPLANATIONS.mostCommonTier.whyItMatters}</p>
            </div>
          )}
        </Card>

        {/* Largest Insurer */}
        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setExpandedStat(expandedStat === 'largestInsurer' ? null : 'largestInsurer')}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Largest Insurer</p>
              <p className="text-3xl font-bold text-red-900">{largestInsurer}</p>
            </div>
            <Info className="w-5 h-5 text-red-500" />
          </div>
          {expandedStat === 'largestInsurer' && (
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <p>{STAT_EXPLANATIONS.largestInsurer.explanation}</p>
              <p><strong>What it means:</strong> {STAT_EXPLANATIONS.largestInsurer.whatItMeans}</p>
              <p><strong>Why it matters:</strong> {STAT_EXPLANATIONS.largestInsurer.whyItMatters}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Charts Section */}
      {insurerData.length > 0 && (
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Plans by Insurer</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insurerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">{STAT_EXPLANATIONS.byInsurer.explanation}</p>
        </Card>
      )}

      {tierData.length > 0 && (
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Plans by Tier</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tierData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, count }) => `${name}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {tierData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">{STAT_EXPLANATIONS.byTier.explanation}</p>
        </Card>
      )}

      {/* Summary Section */}
      <Card className="p-8 bg-blue-50 border-blue-200 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What This Means</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>{stats.totalPlans} plans</strong> analyzed across the Irish health insurance market - the most comprehensive dataset available
          </p>
          <p>
            Average data completeness: <strong>{stats.avgCompleteness}%</strong> - ensures reliable recommendations
          </p>
          <p>
            <strong>{stats.insurerCount || Object.keys(stats.byInsurer || {}).length} major insurers</strong> represented - competitive market with diverse options
          </p>
          <p>
            <strong>{mostCommonTier}</strong> is the most popular tier - suggests good value for money at this price point
          </p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={onRestart}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </Button>
        <Button
          onClick={() => alert("Share functionality coming soon")}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share Results
        </Button>
      </div>
    </div>
  )
}
