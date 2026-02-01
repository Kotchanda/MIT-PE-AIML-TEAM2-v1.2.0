# Post-Session Stats Panel (Template) — v1.2.0

Show this **after each chat session**, using **anonymous telemetry only**.

## What changed in question order (since last model update)
- **Moved up**: {question_id} (+{delta})
- **Moved down**: {question_id} (-{delta})

## Current top questions (asked earliest)
| Rank | Question | Avg info-gain | Drop-off |
|---:|---|---:|---:|
| 1 | Q_HOSPITAL_LEVEL | 0.65 | 5% |
| 2 | Q_PRICE_POSTURE | 0.48 | 6% |
| 3 | Q_MATERNITY | 0.41 | 7% |

## Current bottom questions (asked later)
| Rank | Question | Avg info-gain | Drop-off |
|---:|---|---:|---:|
| 8 | Q_EXCESS_TOLERANCE | 0.10 | 18% |

## Data quality
- Plans in dataset: {plan_count}
- Avg completeness_score: {avg_completeness}
- % plans with completeness_score ≥ 0.7: {pct_high_quality}

## Privacy note
These stats are computed from **non-identifying session metrics** only (no conversation payloads stored).