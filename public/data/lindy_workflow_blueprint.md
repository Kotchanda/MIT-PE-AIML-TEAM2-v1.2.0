# lindy.ai Workflow Blueprint — Irish Health Insurance Chooser (v1.2.0)

This version adds:
- **Maximum coverage expansion** (many plan stubs)
- **Optimization cycle** based on anonymous telemetry
- **Post-session stats panel** showing question-order movements

## Required gating: compliance + consent (no-storage)
Before any questions, show the consent gate text from `compliance_statement.md`.
- If user declines: allow exit or continue with a non-health-data path.

## Files
- question_bank.json
- plans.csv / plans.json (expanded; includes completeness_score)
- benefit_dictionary.json
- scoring_spec.json
- data_enrichment_checklist.md
- completeness_score.md + compute_completeness.py
- session_analytics_schema.json
- post_session_stats_panel.md
- compliance_statement.md

## Core rules
1) NULL is unknown (do not treat as false)
2) Compute/validate completeness_score after loading plans
3) Prefer higher completeness_score as a tie-breaker
4) Always show sources and verification flags

## Runtime blocks (per session)
1. Consent gate (no-storage, explicit consent for health inputs)
2. Load question bank
3. Load plan dataset
4. Compute/validate completeness_score
5. Ask-next loop (prioritized)
6. NULL-safe elimination
7. Weighted scoring + tie-breakers
8. Explainable recommendations + verification badges
9. Feedback (helpful? which plan clicked?)
10. Log anonymous session analytics (no payload)
11. **Show post-session stats panel** (computed from aggregated telemetry; show deltas)

## Optimization cycle (offline, after N sessions)
Frequency: daily or weekly (depends on traffic)
1. Aggregate telemetry:
   - info-gain per question
   - drop-off per question
   - path success (plan clicked / satisfaction)
2. Update question priorities:
   - increase effective priority for high info-gain + low friction questions
   - decrease for low info-gain + high drop-off questions
3. Publish a new question_bank.json version
4. Next sessions show “What changed” stats