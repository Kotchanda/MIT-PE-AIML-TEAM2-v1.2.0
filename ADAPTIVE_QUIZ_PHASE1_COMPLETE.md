# Adaptive Quiz System - Phase 1 Implementation Complete ✅

## Overview

Phase 1 of the adaptive quiz optimization system has been successfully implemented. This phase establishes the **database infrastructure** and **backend ranking engine** that will power the adaptive question selection algorithm.

## What Was Completed

### 1. Database Schema (Prisma Migration)

Created 4 new PostgreSQL tables to track adaptive quiz data:

#### `QuestionStatistics`
Tracks discriminative power and effectiveness of each question.

**Key Fields**:
- `questionKey` (unique): Identifier like "hospitalCover", "budgetRange"
- `questionText`: Display text for the question
- `discriminativePower` (0-100): How well this question separates plans
- `totalResponses`: Total times this question was answered
- `uniqueUsers`: Unique users who answered this question
- `avgPlansEliminatedPerResponse`: Average plans filtered out per answer
- `questionRank`: Ranking among all questions (1 = most discriminative)

**Purpose**: Stores aggregated statistics about each question's effectiveness at narrowing down plans.

#### `QuestionResponseAnalytics`
Detailed analytics for each question-answer combination.

**Key Fields**:
- `questionKey` + `answerValue` (unique): e.g., "hospitalCover" + "yes"
- `plansMatchingAnswer`: How many plans match this answer
- `plansNotMatchingAnswer`: How many plans don't match
- `discriminativePower`: Discriminative power of this specific answer
- `timesSelected`: How many times users selected this answer
- `percentageOfResponses`: % of all responses for this question

**Purpose**: Tracks how each answer option affects plan recommendations.

#### `AdaptiveQuizSession`
Extended session tracking for adaptive quiz flow.

**Key Fields**:
- `sessionId` (unique): Links to main Session table
- `currentQuestionIndex`: Which question we're on (0-indexed)
- `questionsAskedOrder`: JSON array of question keys in order asked
- `plansRemainingCount`: How many plans still match criteria
- `discriminativePowerUsed`: Average discriminative power of questions asked
- `timePerQuestion`: JSON array of time spent on each question

**Purpose**: Tracks the adaptive quiz progression for each user session.

#### `QuestionRankingCache`
Pre-computed ranking of questions for quick lookup.

**Key Fields**:
- `questionKey` (unique): Question identifier
- `rank`: Ranking position (1 = most discriminative)
- `discriminativePower`: Current discriminative power score
- `expiresAt`: When this cache entry expires
- `isValid`: Whether cache is still valid

**Purpose**: Caches question rankings to avoid recalculating on every request.

### 2. Adaptive Ranking Engine (`lib/adaptive-ranking-engine.ts`)

Core TypeScript module implementing the discriminative power algorithm.

#### Key Classes & Methods

**`AdaptiveRankingEngine` class**:

1. **`calculateDiscriminativePower(questionKey, answerValue, allPlans)`**
   - Calculates discriminative power for a specific question-answer combination
   - Formula: `|Plans(YES) - Plans(NO)| / Total Plans × 100`
   - Returns: `FilterResult` with matching/non-matching plans and discriminative power

2. **`filterPlansByAnswer(questionKey, answerValue, allPlans)`**
   - Filters plans based on question-answer combination
   - Implements business logic for matching plans to answers
   - Handles all 12 quiz questions with specific filtering rules

3. **`getRankedQuestions(limit)`**
   - Gets top-ranked questions sorted by discriminative power
   - Calculates average discriminative power across answer options
   - Returns array of `RankedQuestion` objects

4. **`getNextBestQuestion(questionsAlreadyAsked)`**
   - Returns the next best question to ask
   - Filters out questions already asked
   - Returns highest-ranked remaining question

5. **`recordQuestionResponse(questionKey, answerValue, plansRemaining)`**
   - Records a user's answer to the database
   - Updates `QuestionResponseAnalytics` table
   - Increments response counts in `QuestionStatistics`

6. **`initializeQuestionStatistics()`**
   - Initializes all 12 quiz questions in the database
   - Called once during app setup
   - Creates `QuestionStatistics` records for each question

#### Discriminative Power Calculation

The core algorithm that ranks questions:

```
Discriminative Power = |Plans(YES) - Plans(NO)| / Total Plans × 100
```

**Example**:
- Total plans: 272
- Plans matching "hospitalCover=yes": 150
- Plans matching "hospitalCover=no": 122
- Discriminative Power = |150 - 122| / 272 × 100 = **10.29%**

**Interpretation**:
- Higher discriminative power = better at narrowing down plans
- A question with 50% discriminative power eliminates ~136 plans per answer
- A question with 10% discriminative power eliminates ~27 plans per answer

### 3. API Endpoints

#### `GET /api/adaptive-quiz/next-question`

Returns the next best question to ask based on current quiz state.

**Query Parameters**:
- `questionsAsked`: Comma-separated list of question keys already asked
- `plansRemaining`: Current number of plans matching user's answers (optional)

**Response**:
```json
{
  "success": true,
  "question": {
    "questionKey": "budgetRange",
    "questionText": "What is your monthly budget?",
    "discriminativePower": 45.2,
    "rank": 1,
    "avgPlansEliminatedPerResponse": 122.5
  },
  "allQuestionsAsked": false,
  "totalQuestionsAvailable": 12,
  "questionsAskedCount": 2,
  "plansRemaining": 150
}
```

**Usage**:
```typescript
// Get next question after asking 2 questions
const response = await fetch(
  '/api/adaptive-quiz/next-question?questionsAsked=ageGroup,budgetRange&plansRemaining=150'
);
const data = await response.json();
console.log(data.question); // Next best question
```

#### `POST /api/adaptive-quiz/record-response`

Records a user's answer and updates statistics.

**Request Body**:
```json
{
  "questionKey": "hospitalCover",
  "answerValue": "yes",
  "plansRemaining": 150
}
```

**Response**:
```json
{
  "success": true,
  "message": "Response recorded for question: hospitalCover",
  "recordedData": {
    "questionKey": "hospitalCover",
    "answerValue": "yes",
    "plansRemaining": 150,
    "timestamp": "2026-02-17T21:44:00.000Z"
  }
}
```

**Usage**:
```typescript
// Record user's answer
await fetch('/api/adaptive-quiz/record-response', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    questionKey: 'hospitalCover',
    answerValue: 'yes',
    plansRemaining: 150
  })
});
```

#### `POST /api/adaptive-quiz/initialize`

Initializes the question statistics table (call once during setup).

**Response**:
```json
{
  "success": true,
  "message": "Initialized 12 questions for adaptive quiz system",
  "questionsInitialized": 12,
  "questions": [
    {
      "questionKey": "ageGroup",
      "questionText": "What is your age group?",
      "questionType": "multiple-choice",
      "discriminativePower": 0
    },
    // ... more questions
  ]
}
```

**Usage** (call once on app startup):
```typescript
// Initialize questions
await fetch('/api/adaptive-quiz/initialize', { method: 'POST' });
```

## How It Works

### The Adaptive Algorithm

1. **User starts quiz**: System has 272 plans available
2. **Get next question**: Call `/api/adaptive-quiz/next-question?questionsAsked=`
   - Returns highest-ranked question (e.g., "budgetRange" with 45% discriminative power)
3. **User answers**: User selects answer (e.g., "50-100")
4. **Record response**: Call `/api/adaptive-quiz/record-response`
   - Updates statistics in database
5. **Filter plans**: System filters plans matching the answer
   - Example: 150 plans match "budgetRange=50-100"
6. **Repeat**: Get next question with updated `questionsAsked` and `plansRemaining`
   - Next question might be "hospitalCover" (40% discriminative power)
7. **Continue**: After 5-6 questions, plans are narrowed down to 5-10 options
8. **Generate recommendations**: Show top 5 plans to user

### Example Flow

```
Start: 272 plans available

Q1: "What is your monthly budget?" (45% discriminative power)
   Answer: "50-100"
   → 150 plans match
   → 122 plans eliminated

Q2: "Do you need hospital cover?" (40% discriminative power)
   Answer: "yes"
   → 85 plans match
   → 65 plans eliminated

Q3: "How important is consultant choice?" (35% discriminative power)
   Answer: "important"
   → 42 plans match
   → 43 plans eliminated

Q4: "Do you need dental/optical cover?" (30% discriminative power)
   Answer: "both"
   → 18 plans match
   → 24 plans eliminated

Q5: "How important are day-to-day benefits?" (25% discriminative power)
   Answer: "important"
   → 8 plans match
   → 10 plans eliminated

Result: 8 plans narrowed down from 272 in just 5 questions!
```

## Database Setup

### Migration Applied

```bash
# Migration file: prisma/migrations/20260217214226_add_adaptive_quiz_tables/migration.sql
# Status: ✅ Applied successfully
```

### Tables Created

```sql
-- All 4 tables created with proper indexes:
✅ QuestionStatistics
✅ QuestionResponseAnalytics
✅ AdaptiveQuizSession
✅ QuestionRankingCache
```

### Verify Setup

```bash
# Check tables exist
psql -h localhost -U sandbox -d irish_health_insurance -c "\dt"

# Should show:
# - QuestionStatistics
# - QuestionResponseAnalytics
# - AdaptiveQuizSession
# - QuestionRankingCache
```

## Next Steps - Phase 2

### Frontend Integration

1. **Modify Quiz Component** (`components/QuizPanel.tsx`):
   - Replace static question list with dynamic API calls
   - Call `/api/adaptive-quiz/next-question` to get next question
   - Call `/api/adaptive-quiz/record-response` when user answers
   - Track `questionsAsked` and `plansRemaining` in component state

2. **Update Quiz Flow**:
   ```typescript
   // Instead of:
   const questions = STATIC_QUESTIONS; // ❌ Old way
   
   // Do this:
   const nextQuestion = await fetch(
     `/api/adaptive-quiz/next-question?questionsAsked=${asked.join(',')}`
   ).then(r => r.json());
   ```

3. **Track Session Progress**:
   - Create `AdaptiveQuizSession` record when quiz starts
   - Update `questionsAskedOrder` and `plansRemainingCount` as user progresses
   - Use for analytics and debugging

### Background Job - Discriminative Power Calculation

1. **Create Scheduled Job** (e.g., daily):
   - Recalculate discriminative power for all questions
   - Update `QuestionStatistics.discriminativePower`
   - Update `QuestionRankingCache` with new rankings
   - Ensures rankings stay current as user data accumulates

2. **Implementation Options**:
   - **Vercel Cron**: Use `vercel.json` for scheduled functions
   - **External Service**: Use Inngest, Bull, or similar
   - **Manual Trigger**: API endpoint to recalculate on demand

### Analytics & Monitoring

1. **Track Metrics**:
   - Average questions needed to narrow down plans
   - Most frequently asked questions
   - Conversion rate (users who select top recommendation)
   - Time spent per question

2. **Optimize Over Time**:
   - Identify questions with low discriminative power
   - Consider removing or rephrasing ineffective questions
   - A/B test different question orderings

## Testing the System

### Manual Testing

```bash
# 1. Initialize questions (call once)
curl -X POST http://localhost:3000/api/adaptive-quiz/initialize

# 2. Get first question
curl "http://localhost:3000/api/adaptive-quiz/next-question?questionsAsked="

# 3. Record a response
curl -X POST http://localhost:3000/api/adaptive-quiz/record-response \
  -H "Content-Type: application/json" \
  -d '{
    "questionKey": "budgetRange",
    "answerValue": "50-100",
    "plansRemaining": 150
  }'

# 4. Get next question
curl "http://localhost:3000/api/adaptive-quiz/next-question?questionsAsked=budgetRange&plansRemaining=150"
```

### Automated Testing

Create test file: `__tests__/adaptive-ranking-engine.test.ts`

```typescript
import { adaptiveRankingEngine } from '@/lib/adaptive-ranking-engine'

describe('AdaptiveRankingEngine', () => {
  it('should calculate discriminative power correctly', async () => {
    // Test discriminative power calculation
  })

  it('should rank questions by discriminative power', async () => {
    // Test question ranking
  })

  it('should filter plans correctly', async () => {
    // Test plan filtering logic
  })

  it('should return next best question', async () => {
    // Test next question selection
  })
})
```

## Key Metrics & Formulas

### Discriminative Power
```
DP = |Plans(YES) - Plans(NO)| / Total Plans × 100
Range: 0-100%
Higher = Better at narrowing down plans
```

### Plans Eliminated Per Answer
```
Eliminated = max(Plans(YES), Plans(NO))
Example: If 150 plans match YES and 122 match NO
Eliminated = 150 (the larger group)
```

### Average Discriminative Power
```
Avg DP = Sum of all answer DPs / Number of answers
Used to rank questions overall
```

### Effectiveness Score
```
Effectiveness = (Plans Eliminated / Total Plans) × 100
Shows what % of plans are filtered by this question
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Quiz Component)                 │
│  - Displays questions                                        │
│  - Collects user answers                                     │
│  - Tracks progress                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                 │
│  - GET /api/adaptive-quiz/next-question                      │
│  - POST /api/adaptive-quiz/record-response                   │
│  - POST /api/adaptive-quiz/initialize                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            AdaptiveRankingEngine (Backend Logic)             │
│  - calculateDiscriminativePower()                            │
│  - filterPlansByAnswer()                                     │
│  - getRankedQuestions()                                      │
│  - getNextBestQuestion()                                     │
│  - recordQuestionResponse()                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  - QuestionStatistics                                        │
│  - QuestionResponseAnalytics                                 │
│  - AdaptiveQuizSession                                       │
│  - QuestionRankingCache                                      │
│  - Plan (existing)                                           │
│  - Session (existing)                                        │
└─────────────────────────────────────────────────────────────┘
```

## Files Created/Modified

### New Files
- ✅ `lib/adaptive-ranking-engine.ts` - Core ranking engine
- ✅ `app/api/adaptive-quiz/next-question/route.ts` - Next question API
- ✅ `app/api/adaptive-quiz/record-response/route.ts` - Record response API
- ✅ `app/api/adaptive-quiz/initialize/route.ts` - Initialize API
- ✅ `prisma/migrations/20260217214226_add_adaptive_quiz_tables/` - Database migration

### Modified Files
- ✅ `prisma/schema.prisma` - Added 4 new models

## Summary

**Phase 1 is complete!** ✅

The adaptive quiz system now has:
- ✅ Database infrastructure (4 new tables with proper indexes)
- ✅ Backend ranking engine (discriminative power calculation)
- ✅ API endpoints (next question, record response, initialize)
- ✅ Question filtering logic (all 12 quiz questions)
- ✅ Session tracking (adaptive quiz progression)

**Ready for Phase 2**: Frontend integration to use the adaptive system in the actual quiz component.

---

**Last Updated**: February 17, 2026
**Status**: Phase 1 Complete ✅
**Next Phase**: Frontend Integration (Phase 2)
