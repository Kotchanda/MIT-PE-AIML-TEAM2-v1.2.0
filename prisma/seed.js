/**
 * Prisma Seed Script
 * Populates the database with sample health insurance plans
 * Run with: npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // VHI Plans
  const vhiPlans = [
    {
      name: 'VHI Health One',
      provider: 'VHI',
      planType: 'basic',
      monthlyPremium: 45.99,
      annualPremium: 551.88,
      hospitalCover: false,
      consultantChoice: false,
      dentalCover: false,
      opticalCover: false,
      maternityExtras: false,
      dayToDayBenefits: false,
      menopauseBenefit: false,
      prescriptionCover: false,
      physioRehab: false,
      mentalHealthSupport: false,
      description: 'Basic health insurance plan with essential coverage',
      keyFeatures: ['GP visits covered', 'Emergency care', 'Basic hospital cover'],
    },
    {
      name: 'VHI Health Two',
      provider: 'VHI',
      planType: 'standard',
      monthlyPremium: 89.99,
      annualPremium: 1079.88,
      hospitalCover: true,
      consultantChoice: false,
      dentalCover: true,
      opticalCover: false,
      maternityExtras: true,
      dayToDayBenefits: true,
      menopauseBenefit: false,
      prescriptionCover: true,
      physioRehab: true,
      mentalHealthSupport: false,
      gpVisitCost: 0,
      description: 'Standard health insurance with hospital and dental coverage',
      keyFeatures: ['Hospital cover', 'Dental coverage', 'Maternity extras', 'Physio & rehab'],
    },
    {
      name: 'VHI Health Three',
      provider: 'VHI',
      planType: 'comprehensive',
      monthlyPremium: 149.99,
      annualPremium: 1799.88,
      hospitalCover: true,
      consultantChoice: true,
      dentalCover: true,
      opticalCover: true,
      maternityExtras: true,
      dayToDayBenefits: true,
      menopauseBenefit: true,
      prescriptionCover: true,
      physioRehab: true,
      mentalHealthSupport: true,
      gpVisitCost: 0,
      dentalCoveragePercent: 80,
      opticalCoveragePercent: 80,
      description: 'Comprehensive health insurance with full coverage',
      keyFeatures: ['Full hospital cover', 'Consultant choice', 'Dental & optical', 'Mental health support'],
    },
  ];

  // Laya Plans
  const layaPlans = [
    {
      name: 'Laya Essential',
      provider: 'Laya',
      planType: 'basic',
      monthlyPremium: 42.50,
      annualPremium: 510.00,
      hospitalCover: false,
      consultantChoice: false,
      dentalCover: false,
      opticalCover: false,
      maternityExtras: false,
      dayToDayBenefits: false,
      menopauseBenefit: false,
      prescriptionCover: false,
      physioRehab: false,
      mentalHealthSupport: false,
      description: 'Essential health insurance coverage',
      keyFeatures: ['Emergency care', 'GP support', 'Basic coverage'],
    },
    {
      name: 'Laya Core',
      provider: 'Laya',
      planType: 'standard',
      monthlyPremium: 85.00,
      annualPremium: 1020.00,
      hospitalCover: true,
      consultantChoice: false,
      dentalCover: true,
      opticalCover: true,
      maternityExtras: true,
      dayToDayBenefits: true,
      menopauseBenefit: false,
      prescriptionCover: true,
      physioRehab: true,
      mentalHealthSupport: false,
      gpVisitCost: 0,
      dentalCoveragePercent: 70,
      opticalCoveragePercent: 70,
      description: 'Core health insurance with hospital and dental/optical',
      keyFeatures: ['Hospital cover', 'Dental & optical', 'Day-to-day benefits', 'Physio'],
    },
    {
      name: 'Laya Complete',
      provider: 'Laya',
      planType: 'comprehensive',
      monthlyPremium: 145.00,
      annualPremium: 1740.00,
      hospitalCover: true,
      consultantChoice: true,
      dentalCover: true,
      opticalCover: true,
      maternityExtras: true,
      dayToDayBenefits: true,
      menopauseBenefit: true,
      prescriptionCover: true,
      physioRehab: true,
      mentalHealthSupport: true,
      gpVisitCost: 0,
      dentalCoveragePercent: 85,
      opticalCoveragePercent: 85,
      description: 'Complete health insurance with all benefits',
      keyFeatures: ['Full coverage', 'Consultant choice', 'Mental health support', 'Menopause benefit'],
    },
  ];

  // Irish Life Health Plans
  const irishLifePlans = [
    {
      name: 'Irish Life Health Start',
      provider: 'Irish Life Health',
      planType: 'basic',
      monthlyPremium: 48.00,
      annualPremium: 576.00,
      hospitalCover: false,
      consultantChoice: false,
      dentalCover: false,
      opticalCover: false,
      maternityExtras: false,
      dayToDayBenefits: false,
      menopauseBenefit: false,
      prescriptionCover: false,
      physioRehab: false,
      mentalHealthSupport: false,
      description: 'Starting health insurance plan',
      keyFeatures: ['Basic coverage', 'Emergency care', 'GP support'],
    },
    {
      name: 'Irish Life Health Plus',
      provider: 'Irish Life Health',
      planType: 'standard',
      monthlyPremium: 92.00,
      annualPremium: 1104.00,
      hospitalCover: true,
      consultantChoice: false,
      dentalCover: true,
      opticalCover: false,
      maternityExtras: true,
      dayToDayBenefits: true,
      menopauseBenefit: false,
      prescriptionCover: true,
      physioRehab: true,
      mentalHealthSupport: false,
      gpVisitCost: 0,
      dentalCoveragePercent: 75,
      description: 'Plus health insurance with enhanced benefits',
      keyFeatures: ['Hospital cover', 'Dental coverage', 'Maternity extras', 'Day-to-day benefits'],
    },
    {
      name: 'Irish Life Health Premium',
      provider: 'Irish Life Health',
      planType: 'comprehensive',
      monthlyPremium: 155.00,
      annualPremium: 1860.00,
      hospitalCover: true,
      consultantChoice: true,
      dentalCover: true,
      opticalCover: true,
      maternityExtras: true,
      dayToDayBenefits: true,
      menopauseBenefit: true,
      prescriptionCover: true,
      physioRehab: true,
      mentalHealthSupport: true,
      gpVisitCost: 0,
      dentalCoveragePercent: 90,
      opticalCoveragePercent: 90,
      description: 'Premium health insurance with comprehensive coverage',
      keyFeatures: ['Full coverage', 'Consultant choice', 'All benefits included', 'Mental health support'],
    },
  ];

  // Level Health Plans
  const levelPlans = [
    {
      name: 'Level Essential',
      provider: 'Level Health',
      planType: 'basic',
      monthlyPremium: 39.99,
      annualPremium: 479.88,
      hospitalCover: false,
      consultantChoice: false,
      dentalCover: false,
      opticalCover: false,
      maternityExtras: false,
      dayToDayBenefits: false,
      menopauseBenefit: false,
      prescriptionCover: false,
      physioRehab: false,
      mentalHealthSupport: false,
      description: 'Essential health insurance from new provider Level Health',
      keyFeatures: ['Affordable', 'Basic coverage', 'Emergency care'],
    },
    {
      name: 'Level Standard',
      provider: 'Level Health',
      planType: 'standard',
      monthlyPremium: 79.99,
      annualPremium: 959.88,
      hospitalCover: true,
      consultantChoice: false,
      dentalCover: true,
      opticalCover: true,
      maternityExtras: true,
      dayToDayBenefits: true,
      menopauseBenefit: false,
      prescriptionCover: true,
      physioRehab: true,
      mentalHealthSupport: false,
      gpVisitCost: 0,
      dentalCoveragePercent: 70,
      opticalCoveragePercent: 70,
      description: 'Standard health insurance with good value',
      keyFeatures: ['Hospital cover', 'Dental & optical', 'Competitive pricing', 'Physio & rehab'],
    },
    {
      name: 'Level Premium',
      provider: 'Level Health',
      planType: 'comprehensive',
      monthlyPremium: 139.99,
      annualPremium: 1679.88,
      hospitalCover: true,
      consultantChoice: true,
      dentalCover: true,
      opticalCover: true,
      maternityExtras: true,
      dayToDayBenefits: true,
      menopauseBenefit: true,
      prescriptionCover: true,
      physioRehab: true,
      mentalHealthSupport: true,
      gpVisitCost: 0,
      dentalCoveragePercent: 85,
      opticalCoveragePercent: 85,
      description: 'Premium health insurance with full benefits at competitive price',
      keyFeatures: ['Full coverage', 'Consultant choice', 'Mental health support', 'Best value premium'],
    },
  ];

  // Combine all plans
  const allPlans = [...vhiPlans, ...layaPlans, ...irishLifePlans, ...levelPlans];

  // Create plans in database
  for (const plan of allPlans) {
    try {
      const created = await prisma.plan.create({
        data: plan,
      });
      console.log(`✓ Created: ${created.name}`);
    } catch (error) {
      console.error(`✗ Error creating ${plan.name}:`, error.message);
    }
  }

  console.log(`\n✅ Seed complete! Created ${allPlans.length} plans`);
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
