# Tool Contracts (Recommended) for lindy.ai Integration

You can host these as static files OR behind a lightweight API. Static hosting is enough to start.

## 1) Load Question Bank
**GET** `/question_bank.json`
- Returns the full question bank.

## 2) Load Plans Dataset
**GET** `/plans.json`  (or `/plans.csv`)
- Returns normalized plan rows.

## 3) Log Anonymous Analytics
**POST** `/session_analytics`
Content-Type: application/json

Body example:
```json
{
  "session_id": "b7ff0b1d-9c45-4c0c-b718-2a7f1d1f1f10",
  "timestamp_utc": "2026-01-18T12:00:00Z",
  "questions_asked": ["Q_HOSPITAL_LEVEL","Q_PRICE_POSTURE","Q_MATERNITY"],
  "answered_count": 3,
  "dropoff_question_id": null,
  "final_plans_presented": ["ILH_PLAN_123","VHI_PLAN_987","LAYA_PLAN_555"],
  "plan_clicked": "VHI_PLAN_987",
  "user_satisfied": "yes",
  "time_to_recommendation_seconds": 94
}
```

## 4) (Optional) Read Aggregated Analytics to Tune Priorities
**GET** `/analytics_summary`
Return:
- dropoff_rate_by_question
- acceptance_rate_by_question_path
- popularity_score_by_question

This powers `popularity_score` and `friction_score` in the priority formula.