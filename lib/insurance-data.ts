/**
 * Irish Health Insurance Data
 * Contains all providers, plans, and coverage information
 * Data sourced from HIA 2024 market report and provider websites
 */

import type { HealthInsuranceProvider, HealthInsurancePlan } from './types'

// Health Insurance Providers
export const providers: HealthInsuranceProvider[] = [
  {
    id: 'vhi',
    name: 'VHI Healthcare',
    marketShare: 48.4,
    customerBase: '1.2 million',
    founded: 1957,
    description: 'Ireland\'s largest health insurance provider with the most comprehensive network',
    website: 'https://www.vhi.ie',
    phone: '1800 800 800',
  },
  {
    id: 'laya',
    name: 'Laya Healthcare',
    marketShare: 28.4,
    customerBase: '850,000+',
    founded: 2006,
    description: 'Fast-growing provider with innovative plans and competitive pricing',
    website: 'https://www.layahealthcare.ie',
    phone: '1800 30 40 50',
  },
  {
    id: 'irishlife',
    name: 'Irish Life Health',
    marketShare: 20.4,
    customerBase: '600,000+',
    founded: 1991,
    description: 'Part of Irish Life group, offering integrated health and financial services',
    website: 'https://www.irishlife.ie/health-insurance',
    phone: '1800 44 99 99',
  },
  {
    id: 'level',
    name: 'Level Health',
    marketShare: 2.6,
    customerBase: 'Growing',
    founded: 2024,
    description: 'New entrant backed by Aviva, offering simplified plans with lower prices',
    website: 'https://www.levelhealth.ie',
    phone: '1800 123 456',
  },
]

// Health Insurance Plans
export const plans: HealthInsurancePlan[] = [
  // VHI Plans
  {
    id: 'vhi-publicplus-care',
    providerId: 'vhi',
    name: 'PublicPlus Care',
    tier: 'basic',
    adultPrice: 1450,
    childPrice: 450,
    familyPrice: 3200,
    coverage: {
      inpatient: true,
      dayPatient: true,
      outpatient: false,
      gp: false,
      dental: false,
      optical: false,
      mental: false,
      physiotherapy: false,
    },
    features: [
      'Private hospital accommodation',
      'Consultant choice',
      'Day patient procedures',
      'No waiting period for switchers',
    ],
    waitingPeriod: 0,
    excess: 100,
    hospitalNetwork: ['Blackrock Clinic', 'Mater Private', 'Beacon Hospital', 'Hermitage Clinic'],
    description: 'Essential inpatient cover with private hospital access',
  },
  {
    id: 'vhi-premium-care',
    providerId: 'vhi',
    name: 'Premium Care',
    tier: 'premium',
    adultPrice: 2100,
    childPrice: 650,
    familyPrice: 4800,
    coverage: {
      inpatient: true,
      dayPatient: true,
      outpatient: true,
      gp: true,
      dental: true,
      optical: true,
      mental: true,
      physiotherapy: true,
    },
    features: [
      'Comprehensive inpatient cover',
      'Day patient procedures',
      'Outpatient services',
      'GP visits covered',
      'Dental and optical benefits',
      'Mental health support',
      'Physiotherapy',
      'No excess on selected procedures',
    ],
    waitingPeriod: 0,
    excess: 0,
    hospitalNetwork: ['Blackrock Clinic', 'Mater Private', 'Beacon Hospital', 'Hermitage Clinic', 'Galway Clinic'],
    description: 'Comprehensive coverage including day-to-day healthcare',
  },

  // Laya Healthcare Plans
  {
    id: 'laya-essential-health-300',
    providerId: 'laya',
    name: 'Essential Health 300',
    tier: 'basic',
    adultPrice: 1380,
    childPrice: 420,
    familyPrice: 3050,
    coverage: {
      inpatient: true,
      dayPatient: true,
      outpatient: false,
      gp: false,
      dental: false,
      optical: false,
      mental: false,
      physiotherapy: false,
    },
    features: [
      'Private hospital accommodation',
      'Consultant choice',
      'Day patient cover',
      'Competitive pricing',
    ],
    waitingPeriod: 0,
    excess: 150,
    hospitalNetwork: ['Blackrock Clinic', 'Mater Private', 'Beacon Hospital', 'Galway Clinic'],
    description: 'Affordable inpatient cover with essential hospital access',
  },
  {
    id: 'laya-inspire-plus',
    providerId: 'laya',
    name: 'Inspire Plus',
    tier: 'premium',
    adultPrice: 2050,
    childPrice: 620,
    familyPrice: 4600,
    coverage: {
      inpatient: true,
      dayPatient: true,
      outpatient: true,
      gp: true,
      dental: true,
      optical: true,
      mental: true,
      physiotherapy: true,
    },
    features: [
      'Full inpatient and day patient cover',
      'Outpatient services',
      'GP visits',
      'Dental and optical',
      'Mental health services',
      'Physiotherapy',
      'No excess on hip/knee replacements',
      'Wellness programs',
    ],
    waitingPeriod: 0,
    excess: 0,
    hospitalNetwork: ['Blackrock Clinic', 'Mater Private', 'Beacon Hospital', 'Galway Clinic', 'Hermitage Clinic'],
    description: 'Premium plan with comprehensive coverage and wellness benefits',
  },

  // Irish Life Health Plans
  {
    id: 'irishlife-healthguide-2',
    providerId: 'irishlife',
    name: 'HealthGuide 2',
    tier: 'standard',
    adultPrice: 1678,
    childPrice: 510,
    familyPrice: 3750,
    coverage: {
      inpatient: true,
      dayPatient: true,
      outpatient: true,
      gp: false,
      dental: false,
      optical: false,
      mental: false,
      physiotherapy: true,
    },
    features: [
      'Private hospital accommodation',
      'Day patient procedures',
      'Outpatient services',
      'Physiotherapy',
      'No excess on selected orthopaedic procedures',
      'Access to major hospitals',
    ],
    waitingPeriod: 0,
    excess: 75,
    hospitalNetwork: ['Blackrock Clinic', 'Mater Private', 'Beacon Hospital', 'Hermitage Clinic'],
    description: 'Balanced coverage with strong orthopaedic benefits',
  },
  {
    id: 'irishlife-complete-health',
    providerId: 'irishlife',
    name: 'Complete Health',
    tier: 'premium',
    adultPrice: 2200,
    childPrice: 680,
    familyPrice: 5000,
    coverage: {
      inpatient: true,
      dayPatient: true,
      outpatient: true,
      gp: true,
      dental: true,
      optical: true,
      mental: true,
      physiotherapy: true,
    },
    features: [
      'Comprehensive inpatient cover',
      'Day patient procedures',
      'Full outpatient services',
      'GP visits covered',
      'Dental and optical benefits',
      'Mental health support',
      'Physiotherapy',
      'Wellness programs',
      'No excess on major procedures',
    ],
    waitingPeriod: 0,
    excess: 0,
    hospitalNetwork: ['Blackrock Clinic', 'Mater Private', 'Beacon Hospital', 'Hermitage Clinic', 'Galway Clinic'],
    description: 'Complete health coverage with integrated wellness support',
  },

  // Level Health Plans (Simplified)
  {
    id: 'level-essential',
    providerId: 'level',
    name: 'Essential',
    tier: 'basic',
    adultPrice: 1200,
    childPrice: 350,
    familyPrice: 2600,
    coverage: {
      inpatient: true,
      dayPatient: true,
      outpatient: false,
      gp: false,
      dental: false,
      optical: false,
      mental: false,
      physiotherapy: false,
    },
    features: [
      'Private hospital accommodation',
      'Day patient cover',
      'Simplified plan',
      'Free cover for children under 3',
      'No re-serving waiting periods',
    ],
    waitingPeriod: 0,
    excess: 200,
    hospitalNetwork: ['Blackrock Clinic', 'Mater Private', 'Beacon Hospital', 'Galway Clinic'],
    description: 'Simple, affordable inpatient cover with no complexity',
  },
  {
    id: 'level-complete',
    providerId: 'level',
    name: 'Complete',
    tier: 'premium',
    adultPrice: 1800,
    childPrice: 550,
    familyPrice: 3900,
    coverage: {
      inpatient: true,
      dayPatient: true,
      outpatient: true,
      gp: true,
      dental: true,
      optical: true,
      mental: true,
      physiotherapy: true,
    },
    features: [
      'Full inpatient and day patient cover',
      'Outpatient services',
      'GP visits',
      'Dental and optical',
      'Mental health services',
      'Physiotherapy',
      'Simplified plan structure',
      'Free cover for children under 3',
      'Competitive pricing',
    ],
    waitingPeriod: 0,
    excess: 0,
    hospitalNetwork: ['Blackrock Clinic', 'Mater Private', 'Beacon Hospital', 'Galway Clinic', 'Hermitage Clinic'],
    description: 'Comprehensive coverage with Level\'s simplified approach',
  },
]

/**
 * Get provider by ID
 */
export function getProvider(id: string): HealthInsuranceProvider | undefined {
  return providers.find(p => p.id === id)
}

/**
 * Get plans by provider ID
 */
export function getPlansByProvider(providerId: string): HealthInsurancePlan[] {
  return plans.filter(p => p.providerId === providerId)
}

/**
 * Get all plans
 */
export function getAllPlans(): HealthInsurancePlan[] {
  return plans
}

/**
 * Get all providers
 */
export function getAllProviders(): HealthInsuranceProvider[] {
  return providers
}
