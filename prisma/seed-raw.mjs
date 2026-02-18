/**
 * Raw SQL Seed Script using pg package
 * Populates the database with sample health insurance plans
 * Run with: node prisma/seed-raw.mjs
 */

import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log('🌱 Starting database seed with raw SQL...');

  try {
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
        keyFeatures: JSON.stringify(['GP visits covered', 'Emergency care', 'Basic hospital cover']),
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
        keyFeatures: JSON.stringify(['Hospital cover', 'Dental coverage', 'Maternity extras', 'Physio & rehab']),
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
        keyFeatures: JSON.stringify(['Full hospital cover', 'Consultant choice', 'Dental & optical', 'Mental health support']),
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
        keyFeatures: JSON.stringify(['Emergency care', 'GP support', 'Basic coverage']),
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
        keyFeatures: JSON.stringify(['Hospital cover', 'Dental & optical', 'Day-to-day benefits', 'Physio']),
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
        keyFeatures: JSON.stringify(['Full coverage', 'Consultant choice', 'Mental health support', 'Menopause benefit']),
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
        keyFeatures: JSON.stringify(['Basic coverage', 'Emergency care', 'GP support']),
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
        keyFeatures: JSON.stringify(['Hospital cover', 'Dental coverage', 'Maternity extras', 'Day-to-day benefits']),
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
        keyFeatures: JSON.stringify(['Full coverage', 'Consultant choice', 'All benefits included', 'Mental health support']),
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
        keyFeatures: JSON.stringify(['Affordable', 'Basic coverage', 'Emergency care']),
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
        keyFeatures: JSON.stringify(['Hospital cover', 'Dental & optical', 'Competitive pricing', 'Physio & rehab']),
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
        keyFeatures: JSON.stringify(['Full coverage', 'Consultant choice', 'Mental health support', 'Best value premium']),
      },
    ];

    // Combine all plans
    const allPlans = [...vhiPlans, ...layaPlans, ...irishLifePlans, ...levelPlans];

    // Insert plans using raw SQL with generated IDs
    for (const plan of allPlans) {
      const planId = randomUUID(); // Generate UUID for id column
      const query = `
        INSERT INTO "Plan" (
          id, name, provider, "planType", "monthlyPremium", "annualPremium",
          "hospitalCover", "consultantChoice", "dentalCover", "opticalCover",
          "maternityExtras", "dayToDayBenefits", "menopauseBenefit",
          "prescriptionCover", "physioRehab", "mentalHealthSupport",
          "gpVisitCost", "dentalCoveragePercent", "opticalCoveragePercent",
          description, "keyFeatures", "isActive", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, NOW(), NOW()
        )
      `;

      const values = [
        planId,
        plan.name,
        plan.provider,
        plan.planType,
        plan.monthlyPremium,
        plan.annualPremium,
        plan.hospitalCover,
        plan.consultantChoice,
        plan.dentalCover,
        plan.opticalCover,
        plan.maternityExtras,
        plan.dayToDayBenefits,
        plan.menopauseBenefit,
        plan.prescriptionCover,
        plan.physioRehab,
        plan.mentalHealthSupport,
        plan.gpVisitCost || null,
        plan.dentalCoveragePercent || null,
        plan.opticalCoveragePercent || null,
        plan.description,
        plan.keyFeatures,
        true,
      ];

      try {
        await pool.query(query, values);
        console.log(`✓ Created: ${plan.name}`);
      } catch (error) {
        console.error(`✗ Error creating ${plan.name}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log(`\n✅ Seed complete! Created ${allPlans.length} plans`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
