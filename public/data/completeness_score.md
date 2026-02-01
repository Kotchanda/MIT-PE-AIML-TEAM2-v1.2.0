# Completeness Score — How to Use (v1.1.2)

Generated: 2026-01-19T17:57:52Z

## Purpose
`completeness_score` helps you:
1. Prioritize enrichment work (fill missing plan fields first)
2. Improve bot recommendation quality by preferring more fully populated plans when scores are close
3. Track dataset maturity over time

## Definition
Key decision fields (10 total):
- plan_tier
- hospital_cover
- outpatient_cover
- gp_visits
- maternity_cover
- mental_health
- overseas_emergency
- semi_private_room
- private_room
- excess_required

Computed fields:
- `null_key_count` = number of missing values across the key fields
- `completeness_score` = (10 - null_key_count) / 10  → range 0.0–1.0

## Recommended operational cadence
- After each enrichment batch (e.g., 10–20 plans), run the script:
  `python compute_completeness.py plans.csv plans.csv`
  (or write to a new file and then replace plans.csv)

## Bot behavior recommendation (tie-break)
- Keep your scoring model unchanged.
- When plan scores are within 5 points, prefer the plan with the higher completeness_score.
- Always show “Verification needed” if a must-have field is NULL.
