# Data Enrichment Checklist — Irish Health Insurance Chooser (v1.1.1)

Generated: 2026-01-19T17:46:40Z

## Objective
Progressively enrich `plans.csv` / `plans.json` by replacing NULLs with verified values from **public plan pages / PDFs**.
This checklist prioritizes plan rows that currently have the most unknown (NULL) values in the key decision fields.

## Key fields to enrich (in order)
1. `hospital_cover` (PUBLIC / PRIVATE / HI_TECH)
2. `plan_tier` (BASIC / MID / HIGH)
3. `outpatient_cover`, `gp_visits`
4. `maternity_cover`, `maternity_waiting_months`
5. `mental_health`
6. `semi_private_room`, `private_room`
7. `overseas_emergency`, `overseas_planned`
8. `excess_required`, `excess_amount_text`

## Enrichment method (repeatable)
For each plan row:
1. Open `source_url` and locate a plan-specific **Table of Cover / Table of Benefits / plan brochure**.
2. Update the plan row:
   - Set booleans to true/false (avoid assumptions; if not stated, keep NULL)
   - Set enums only when the source is explicit
   - Add a short note to `regulatory_notes` if benefits are conditional
3. Update `source_url` to the *plan-specific* PDF/page (not just the index), when available.
4. Set `last_verified` to today’s date.
5. If you cannot validate a field from public sources, leave it NULL and the bot will show a “Verification needed” flag.

## Prioritized enrichment queue by insurer

### Irish Life Health
- **ILH_STUB_05** — BeneFit Extra (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_STUB_06** — Family Value (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_STUB_13** — HealthGuide 2 (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_STUB_12** — Hospital Focus (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_STUB_11** — MyPlan 500 (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_STUB_10** — MyPlan 350 (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_STUB_09** — MyPlan 150 (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_STUB_08** — Health Value (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_STUB_07** — Health Starter (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_STUB_14** — HealthGuide 3 (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_STUB_04** — BeneFit Access 500 (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_STUB_03** — BeneFit Access 300 (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_STUB_02** — BeneFit 2 Plan (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_STUB_01** — BeneFit 1 Plan (missing 10 key fields) — source: https://www.irishlife.ie/health-insurance/help/tables-of-cover/
- **ILH_HEALTH_PLAN_01_TOC** — Health Plan 01 (missing 8 key fields) — source: https://www.irishlifehealth.ie/mediafiles/pdfs/tables-of-cover/Health-Plan-01-TOC.pdf

### Laya Healthcare
- **LAYA_STUB_01** — Advantage 125 Choice (missing 10 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/
- **LAYA_STUB_02** — Advantage 250 Choice (missing 10 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/
- **LAYA_STUB_03** — Advantage 500 Plus (missing 10 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/
- **LAYA_STUB_04** — Flex 125 Choice (missing 10 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/
- **LAYA_STUB_05** — Flex 250 Explore (missing 10 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/
- **LAYA_STUB_06** — Flex 500 Plus (missing 10 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/
- **LAYA_STUB_07** — Essential Starter (missing 10 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/
- **LAYA_STUB_08** — Essential Plus (No Excess) (missing 10 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/
- **LAYA_STUB_09** — Essential Gold (missing 10 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/
- **LAYA_STUB_10** — SimplyHealth Starter (missing 10 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/
- **LAYA_STUB_11** — Total Health (No Excess) (missing 10 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/
- **LAYA_INSPIRE_HIA_PDF** — Inspire (HIA benefit table PDF) (missing 9 key fields) — source: https://www.hia.ie/sites/default/files/Inspire.pdf
- **LAYA_SIMPLICITY** — Simplicity (missing 8 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/scheme/simplicity
- **LAYA_INSPIRE** — Inspire (missing 8 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/scheme/inspire
- **LAYA_PROSPER** — Prosper (missing 8 key fields) — source: https://www.layahealthcare.ie/productsandservices/plan/scheme/prosper

### Level Health
- **LEVEL_OVERSEAS_PDF** — Overseas cover section (policy PDF) (missing 10 key fields) — source: https://levelhealth.ie/api/download?path=o%2Fassets%252Fbf5aeb09845647e5a8182770c0ca0fdc%252F704e171ef036455b86ca159219483759%3Falt%3Dmedia%26token%3D7d6c7223-3820-4da1-9f6e-dae97a48ab3e
- **LEVEL_1** — Level 1 (missing 8 key fields) — source: https://levelhealth.ie/api/download?path=o%2Fassets%252Fbf5aeb09845647e5a8182770c0ca0fdc%252Fca6b180cf2e64cbf8a7391af0f9ff292%3Falt%3Dmedia%26token%3D511356af-30e0-42f5-a2a7-585a41dc82ce
- **LEVEL_2** — Level 2 (missing 8 key fields) — source: https://levelhealth.ie/api/download?path=o%2Fassets%252Fbf5aeb09845647e5a8182770c0ca0fdc%252Fca6b180cf2e64cbf8a7391af0f9ff292%3Falt%3Dmedia%26token%3D511356af-30e0-42f5-a2a7-585a41dc82ce
- **LEVEL_3** — Level 3 (missing 8 key fields) — source: https://levelhealth.ie/api/download?path=o%2Fassets%252Fbf5aeb09845647e5a8182770c0ca0fdc%252Fca6b180cf2e64cbf8a7391af0f9ff292%3Falt%3Dmedia%26token%3D511356af-30e0-42f5-a2a7-585a41dc82ce
- **LEVEL_4** — Level 4 (missing 8 key fields) — source: https://levelhealth.ie/api/download?path=o%2Fassets%252Fbf5aeb09845647e5a8182770c0ca0fdc%252Fca6b180cf2e64cbf8a7391af0f9ff292%3Falt%3Dmedia%26token%3D511356af-30e0-42f5-a2a7-585a41dc82ce

### VHI Healthcare
- **VHI_PMI_2612** — PMI 26 12 (Table of Benefits) (missing 10 key fields) — source: https://vhi.ie/downloads/table-of-benefits/LIFCPM26
- **VHI_PMI_3613** — PMI 36 13 (Table of Benefits) (missing 10 key fields) — source: https://www.vhi.ie/pdf/myvhi/TOBPMI%203613%20V6%20Aug16.pdf
- **VHI_PLAN_B** — Plan B (Table of Benefits) (missing 10 key fields) — source: https://www.vhi.ie/downloads/table-of-benefits/LIFFPXT
- **VHI_COMPANY_PLAN_PLUS_L1** — Company Plan Plus Level 1 (Table of Benefits) (missing 10 key fields) — source: https://www.vhi.ie/downloads/table-of-benefits/LIFCPP
- **VHI_PMI_05_11** — PMI 05 11 (missing 10 key fields) — source: https://www.hia.ie/news/vhi-healthcare-price-and-benefit-changes-31122022-01012023
- **VHI_PMI_17_10** — PMI 17 10 (missing 10 key fields) — source: https://www.hia.ie/news/vhi-healthcare-price-and-benefit-changes-31122022-01012023
- **VHI_PMI_21_11** — PMI 21 11 (missing 10 key fields) — source: https://www.hia.ie/news/vhi-healthcare-price-and-benefit-changes-31122022-01012023
- **VHI_PMI_24_10** — PMI 24 10 (missing 10 key fields) — source: https://www.hia.ie/news/vhi-healthcare-price-and-benefit-changes-31122022-01012023
- **VHI_PMI_39_14** — PMI 39 14 (missing 10 key fields) — source: https://www.hia.ie/news/vhi-healthcare-price-and-benefit-changes-31122022-01012023
- **VHI_PMI_50_10** — PMI 50 10 (missing 10 key fields) — source: https://www.hia.ie/news/vhi-healthcare-price-and-benefit-changes-31122022-01012023
- **VHI_PMI_53_10** — PMI 53 10 (missing 10 key fields) — source: https://www.hia.ie/news/vhi-healthcare-price-and-benefit-changes-31122022-01012023
- **VHI_PMI_59_10** — PMI 59 10 (missing 10 key fields) — source: https://www.hia.ie/news/vhi-healthcare-price-and-benefit-changes-31122022-01012023## Quality gates (do not skip)
- Do **not** scrape or store premiums from quote engines.
- Do **not** infer benefits: if not explicit, keep NULL.
- Ensure every row has:
  - `source_url` (direct link to plan-specific doc when possible)
  - `last_verified` (date)

## Optional automation
As you enrich, you can auto-calculate:
- `null_key_count` (for prioritization)
- `verification_needed` flag = (any mapped must-have field is NULL)