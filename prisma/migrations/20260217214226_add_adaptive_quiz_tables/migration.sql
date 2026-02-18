-- CreateTable
CREATE TABLE "QuestionStatistics" (
    "id" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "discriminativePower" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalResponses" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "avgPlansEliminatedPerResponse" DOUBLE PRECISION,
    "avgPlansRemainingAfter" DOUBLE PRECISION,
    "questionRank" INTEGER,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "QuestionStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionResponseAnalytics" (
    "id" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "answerValue" TEXT NOT NULL,
    "plansMatchingAnswer" INTEGER NOT NULL DEFAULT 0,
    "plansNotMatchingAnswer" INTEGER NOT NULL DEFAULT 0,
    "discriminativePower" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timesSelected" INTEGER NOT NULL DEFAULT 0,
    "percentageOfResponses" DOUBLE PRECISION,
    "avgScoreImprovement" DOUBLE PRECISION,
    "conversionRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionResponseAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdaptiveQuizSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "questionsAskedOrder" JSONB NOT NULL,
    "plansRemainingCount" INTEGER NOT NULL DEFAULT 272,
    "discriminativePowerUsed" DOUBLE PRECISION,
    "timePerQuestion" JSONB,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AdaptiveQuizSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionRankingCache" (
    "id" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "discriminativePower" DOUBLE PRECISION NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "QuestionRankingCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionStatistics_questionKey_key" ON "QuestionStatistics"("questionKey");

-- CreateIndex
CREATE INDEX "QuestionStatistics_discriminativePower_idx" ON "QuestionStatistics"("discriminativePower");

-- CreateIndex
CREATE INDEX "QuestionStatistics_questionRank_idx" ON "QuestionStatistics"("questionRank");

-- CreateIndex
CREATE INDEX "QuestionStatistics_lastUpdated_idx" ON "QuestionStatistics"("lastUpdated");

-- CreateIndex
CREATE INDEX "QuestionResponseAnalytics_questionKey_idx" ON "QuestionResponseAnalytics"("questionKey");

-- CreateIndex
CREATE INDEX "QuestionResponseAnalytics_discriminativePower_idx" ON "QuestionResponseAnalytics"("discriminativePower");

-- CreateIndex
CREATE INDEX "QuestionResponseAnalytics_timesSelected_idx" ON "QuestionResponseAnalytics"("timesSelected");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionResponseAnalytics_questionKey_answerValue_key" ON "QuestionResponseAnalytics"("questionKey", "answerValue");

-- CreateIndex
CREATE UNIQUE INDEX "AdaptiveQuizSession_sessionId_key" ON "AdaptiveQuizSession"("sessionId");

-- CreateIndex
CREATE INDEX "AdaptiveQuizSession_sessionId_idx" ON "AdaptiveQuizSession"("sessionId");

-- CreateIndex
CREATE INDEX "AdaptiveQuizSession_plansRemainingCount_idx" ON "AdaptiveQuizSession"("plansRemainingCount");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionRankingCache_questionKey_key" ON "QuestionRankingCache"("questionKey");

-- CreateIndex
CREATE INDEX "QuestionRankingCache_rank_idx" ON "QuestionRankingCache"("rank");

-- CreateIndex
CREATE INDEX "QuestionRankingCache_expiresAt_idx" ON "QuestionRankingCache"("expiresAt");
