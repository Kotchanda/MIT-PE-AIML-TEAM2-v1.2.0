/**
 * Consent Gate Component
 * Privacy-focused consent for anonymous session analytics
 * Based on MIT-PE-AIML-TEAM2 v1.2.0 blueprint
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface ConsentGateProps {
  onAccept: (consented: boolean) => void
}

export function ConsentGate({ onAccept }: ConsentGateProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [hasConsented, setHasConsented] = useState(false)

  const handleConsent = (consent: boolean) => {
    setHasConsented(true)
    // Store consent preference in localStorage
    localStorage.setItem('analytics_consent', consent ? 'true' : 'false')
    // Call parent handler with consent decision
    onAccept(consent)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6 bg-white">
        <h2 className="text-xl font-semibold mb-3">Privacy & Analytics</h2>

        <p className="text-sm text-muted-foreground mb-4">
          We'd like to collect anonymous usage data to improve your experience. No personal
          information is stored.
        </p>

        {/* Expandable details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:underline mb-4"
        >
          {showDetails ? 'Hide details' : 'What data do we collect?'}
        </button>

        {showDetails && (
          <div className="bg-slate-50 p-3 rounded mb-4 text-xs text-muted-foreground space-y-2">
            <p>
              <strong>We collect:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Questions you answer (anonymized)</li>
              <li>Time spent on each question</li>
              <li>Which plans you view</li>
              <li>Session duration</li>
              <li>Your satisfaction rating</li>
            </ul>
            <p className="mt-2">
              <strong>We DO NOT collect:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Personal information (name, email, phone)</li>
              <li>Health details beyond your answers</li>
              <li>IP addresses or device identifiers</li>
              <li>Conversation transcripts</li>
            </ul>
            <p className="mt-2">
              This data helps us understand which questions are most helpful and improve our
              recommendations.
            </p>
          </div>
        )}

        {/* Consent options */}
        <div className="space-y-3">
          <Button
            onClick={() => handleConsent(true)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Accept Analytics
          </Button>
          <Button onClick={() => handleConsent(false)} variant="outline" className="w-full">
            Decline
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          You can change this preference anytime in settings
        </p>
      </Card>
    </div>
  )
}
