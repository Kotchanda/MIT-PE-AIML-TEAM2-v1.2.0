-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "ageGroup" TEXT,
    "budgetRange" TEXT,
    "coverageType" TEXT,
    "hospitalCover" TEXT,
    "consultantChoice" TEXT,
    "dentalOptical" TEXT,
    "maternityExtras" TEXT,
    "dayToDayBenefits" TEXT,
    "menopauseBenefit" TEXT,
    "prescriptionCover" TEXT,
    "physioRehab" TEXT,
    "mentalHealthSupport" TEXT,
    "topRecommendation" TEXT,
    "topScore" DOUBLE PRECISION,
    "allRecommendations" JSONB,
    "timeToChoice" INTEGER,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "privacyConsented" BOOLEAN NOT NULL DEFAULT false,
    "userFeedback" TEXT,
    "selectedPlan" TEXT,
    "sessionToken" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "monthlyPremium" DOUBLE PRECISION NOT NULL,
    "annualPremium" DOUBLE PRECISION NOT NULL,
    "hospitalCover" BOOLEAN NOT NULL DEFAULT false,
    "consultantChoice" BOOLEAN NOT NULL DEFAULT false,
    "dentalCover" BOOLEAN NOT NULL DEFAULT false,
    "opticalCover" BOOLEAN NOT NULL DEFAULT false,
    "maternityExtras" BOOLEAN NOT NULL DEFAULT false,
    "dayToDayBenefits" BOOLEAN NOT NULL DEFAULT false,
    "menopauseBenefit" BOOLEAN NOT NULL DEFAULT false,
    "prescriptionCover" BOOLEAN NOT NULL DEFAULT false,
    "physioRehab" BOOLEAN NOT NULL DEFAULT false,
    "mentalHealthSupport" BOOLEAN NOT NULL DEFAULT false,
    "gpVisitCost" DOUBLE PRECISION,
    "hospitalDeductible" DOUBLE PRECISION,
    "dentalCoveragePercent" DOUBLE PRECISION,
    "opticalCoveragePercent" DOUBLE PRECISION,
    "description" TEXT,
    "keyFeatures" JSONB,
    "exclusions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statistics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "completedSessions" INTEGER NOT NULL DEFAULT 0,
    "abandonedSessions" INTEGER NOT NULL DEFAULT 0,
    "avgTimeToChoice" DOUBLE PRECISION,
    "avgQuestionsAnswered" DOUBLE PRECISION,
    "mostSelectedPlan" TEXT,
    "mostSelectedProvider" TEXT,
    "topAgeGroup" TEXT,
    "topBudgetRange" TEXT,
    "avgTopScore" DOUBLE PRECISION,
    "recommendationAccuracy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionPlan" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "scoreBreakdown" JSONB,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_createdAt_idx" ON "Session"("createdAt");

-- CreateIndex
CREATE INDEX "Session_completedAt_idx" ON "Session"("completedAt");

-- CreateIndex
CREATE INDEX "Session_topRecommendation_idx" ON "Session"("topRecommendation");

-- CreateIndex
CREATE INDEX "Plan_provider_idx" ON "Plan"("provider");

-- CreateIndex
CREATE INDEX "Plan_planType_idx" ON "Plan"("planType");

-- CreateIndex
CREATE INDEX "Plan_monthlyPremium_idx" ON "Plan"("monthlyPremium");

-- CreateIndex
CREATE INDEX "Statistics_date_idx" ON "Statistics"("date");

-- CreateIndex
CREATE INDEX "SessionPlan_sessionId_idx" ON "SessionPlan"("sessionId");

-- CreateIndex
CREATE INDEX "SessionPlan_planId_idx" ON "SessionPlan"("planId");

-- CreateIndex
CREATE INDEX "SessionPlan_score_idx" ON "SessionPlan"("score");

-- CreateIndex
CREATE UNIQUE INDEX "SessionPlan_sessionId_planId_key" ON "SessionPlan"("sessionId", "planId");
