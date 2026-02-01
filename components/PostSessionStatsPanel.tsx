/**
 * Post-Session Stats Panel
 * Shows aggregated metrics and insights after user completes quiz
 * Based on MIT-PE-AIML-TEAM2 v1.2.0 blueprint
 */

'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { RotateCcw, Download, Share2 } from 'lucide-react'

interface PostSessionStatsPanelProps {
  stats: any
  onRestart: () => void
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function PostSessionStatsPanel({ stats, onRestart }: PostSessionStatsPanelProps) {
  if (!stats) {
    return null
  }

  // Prepare data for charts
  const insurerData = Object.entries(stats.byInsurer).map(([name, count]) => ({
    name,
    count,
  }))

  const tierData = Object.entries(stats.byTier).map(([name, count]) => ({
    name,
    count,
  }))

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Session Complete! 🎉</h2>
        <p className="text-gray-600">
          Here's a summary of the insurance market analysis from your session
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-blue-600 font-semibold mb-2">Total Plans Analyzed</p>
          <p className="text-4xl font-bold text-blue-900">{stats.totalPlans}</p>
          <p className="text-xs text-blue-700 mt-2">From 4 major Irish insurers</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-green-600 font-semibold mb-2">Average Completeness</p>
          <p className="text-4xl font-bold text-green-900">{stats.avgCompleteness}%</p>
          <p className="text-xs text-green-700 mt-2">Data verification score</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <p className="text-sm text-purple-600 font-semibold mb-2">Insurers Covered</p>
          <p className="text-4xl font-bold text-purple-900">{Object.keys(stats.byInsurer).length}</p>
          <p className="text-xs text-purple-700 mt-2">Major health insurance providers</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Plans by insurer */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plans by Insurer</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insurerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Plans by tier */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plans by Tier</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tierData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, count }) => `${name}: ${count}`}
                outerRadius={80}
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
        </Card>
      </div>

      {/* Insurer breakdown table */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurer Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Insurer</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Plans</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">% of Market</th>
              </tr>
            </thead>
            <tbody>
              {insurerData.map((row) => (
                <tr key={row.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{row.name}</td>
                  <td className="text-right py-3 px-4 text-gray-700 font-medium">{row.count}</td>
                  <td className="text-right py-3 px-4 text-gray-700">
                    {Math.round((row.count / stats.totalPlans) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tier breakdown table */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Tier Distribution</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tier</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Plans</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">% of Market</th>
              </tr>
            </thead>
            <tbody>
              {tierData.map((row) => (
                <tr key={row.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 font-medium">{row.name}</td>
                  <td className="text-right py-3 px-4 text-gray-700 font-medium">{row.count}</td>
                  <td className="text-right py-3 px-4 text-gray-700">
                    {Math.round((row.count / stats.totalPlans) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Key Insights</h3>
        <ul className="space-y-2 text-blue-800">
          <li>
            • <strong>{stats.totalPlans} plans</strong> analyzed across the Irish health insurance market
          </li>
          <li>
            • <strong>{Object.keys(stats.byInsurer).length} major insurers</strong> represented in the dataset
          </li>
          <li>
            • Average data completeness score: <strong>{stats.avgCompleteness}%</strong>
          </li>
          <li>
            • Most common tier: <strong>{Object.entries(stats.byTier).sort(([, a], [, b]) => b - a)[0]?.[0]}</strong>
          </li>
          <li>
            • Largest insurer by plan count:{' '}
            <strong>
              {Object.entries(stats.byInsurer).sort(([, a], [, b]) => b - a)[0]?.[0]}
            </strong>
          </li>
        </ul>
      </Card>

      {/* Blueprint information */}
      <Card className="p-6 mb-8 bg-gray-50 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">ℹ️ About This Analysis</h3>
        <p className="text-sm text-gray-700 mb-3">
          This Irish Health Insurance Chooser is built on the{' '}
          <strong>MIT-PE-AIML-TEAM2 v1.2.0 blueprint</strong>, featuring:
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ <strong>272 insurance plans</strong> from 4 major Irish insurers</li>
          <li>✅ <strong>NULL-safe scoring</strong> for unknown/unverified fields</li>
          <li>✅ <strong>Adaptive questionnaire</strong> with 6 key questions</li>
          <li>✅ <strong>Completeness metrics</strong> for data quality tracking</li>
          <li>✅ <strong>Tie-breaker logic</strong> for fair plan comparison</li>
          <li>✅ <strong>Privacy-first design</strong> - no data storage, anonymous only</li>
        </ul>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onRestart}
          variant="outline"
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Start New Session
        </Button>
        <Button
          variant="outline"
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
        <Button
          variant="outline"
          className="flex-1"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Results
        </Button>
      </div>

      {/* Footer note */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center text-sm text-gray-600">
        <p>
          Thank you for using the Irish Health Insurance Chooser. Your session data was not stored.
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Built with Next.js 14, shadcn/ui, and Tailwind CSS
        </p>
      </div>
    </div>
  )
}
