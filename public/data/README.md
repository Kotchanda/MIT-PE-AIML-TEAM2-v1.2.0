# Irish Health Insurance Chooser — lindy.ai Package v1.2.0

Generated: 2026-02-01T20:13:50Z

## Coverage
- This version expands plan coverage significantly by adding:
  - All **Laya scheme names** listed on their public schemes page.
  - A broad set of **VHI plan names** listed on VHI’s public downloads page.
- Many new entries are **stubs** (features NULL) but include real `source_url` pages where the plan documents are available.

## New capabilities
- Post-session stats panel (question order movements, drop-off, info-gain)
- Optimization cycle to re-rank questions using anonymous telemetry
- Concise consent gate for the no-storage privacy model

## Files added
- compliance_statement.md
- post_session_stats_panel.md

## Next step
Run enrichment in waves:
1) Fill plan-specific PDFs/URLs for the most-used stubs first
2) Populate key benefit fields
3) Recompute completeness_score after each batch