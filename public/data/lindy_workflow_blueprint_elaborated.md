# lindy.ai Implementation Blueprint — Irish Health Insurance Chooser (v1.2.0)

Generated: 2026-02-01T20:53:46Z

This document is an **implementation-grade** blueprint for building the agent in **lindy.ai** using the files in this package.
It is written so you can follow it step-by-step with minimal guesswork.

---

## 0) What you will build

A decision-support chatbot that:
- Collects only the minimum answers needed (adaptive questions)
- Filters + scores plans from four insurers using a normalized dataset
- Produces **explainable** recommendations with source links
- Stores **no conversation payloads** (no-storage model)
- Logs **anonymous** telemetry to optimize question order over time
- Shows a **post-session stats panel** (“questions moved up/down”)

---

## 1) Package files and exact roles

### Runtime inputs (loaded by the bot each session)
1. **`question_bank.json`**
   - Defines each question, allowed answers, mapped dataset fields, elimination rules, and initial priority weights.
2. **`plans.json`** (or `plans.csv`)
   - Normalized plan rows (current coverage: many stubs).
   - Includes computed fields: `null_key_count`, `completeness_score`.
3. **`scoring_spec.json`**
   - Hard filters, feature scoring, tie-breakers, explainability settings.
4. **`benefit_dictionary.json`**
   - Schema + field definitions.
   - Key rule: **NULL = unknown**.
5. **`compliance_statement.md`**
   - Consent gate text (no-storage privacy model).
6. **`post_session_stats_panel.md`**
   - Template for the stats view shown after each completed session.

### Operational / offline tools (not required per chat)
7. **`data_enrichment_checklist.md`**
   - Prioritized enrichment queue for converting stubs → fully populated plans.
8. **`compute_completeness.py`** + **`completeness_score.md`**
   - Recompute `null_key_count` and `completeness_score` after dataset edits.
9. **`session_analytics_schema.json`**
   - Defines what telemetry is allowed to be stored (anonymous, no payload).
10. **`lindy_tool_contracts.md`**
   - Recommended GET/POST endpoints and JSON payload examples.
11. **`dependency_check_report.md`**
   - Sanity checks and counts for this release.
12. **`README.md`**
   - Quick-start notes.

---

## 2) Hosting the files (two supported deployment patterns)

### Pattern A — Static hosting (fastest to start)
Host these as static files on S3 / GitHub Pages / any HTTPS:
- `/question_bank.json`
- `/plans.json`  (preferred over CSV)
- `/scoring_spec.json`
- `/benefit_dictionary.json`
- `/compliance_statement.md`
- `/post_session_stats_panel.md`

Pros: quick.  
Cons: harder to update analytics, no server-side aggregation.

### Pattern B — Lightweight API (recommended)
Provide endpoints:
- `GET /question_bank.json`
- `GET /plans.json`
- `GET /scoring_spec.json`
- `GET /benefit_dictionary.json`
- `GET /compliance_statement.md`
- `GET /post_session_stats_panel.md`
- `POST /session_analytics` (anonymous telemetry append)
- `GET /analytics_summary` (aggregated metrics for ranking updates)

---

## 3) lindy.ai build: step-by-step blocks

> Naming is suggested; adapt to lindy UI names. The important part is the **inputs/outputs**.

### Block 1 — Welcome + consent gate (MANDATORY)
**Goal:** user must agree before any data collection.

**Action:**
- Display the content of `compliance_statement.md`
- Provide buttons:
  - **Agree & Continue**
  - **Decline**

**If Decline:**
- End chat (or optionally continue in “general info mode” with *no personal/health questions*).

**State variables to set:**
- `session_id` = random UUID
- `consent.accepted` = true/false
- `consent.health_data_allowed` = false initially (set true only if you add explicit health-data questions later)

---

### Block 2 — Load configuration files
**Tool calls:**
1. Load question bank:
   - GET `question_bank.json` → `cfg.questions`
2. Load scoring spec:
   - GET `scoring_spec.json` → `cfg.scoring`
3. Load benefit dictionary:
   - GET `benefit_dictionary.json` → `cfg.schema`
4. Load plan dataset:
   - GET `plans.json` → `data.plans`

**Initialize state:**
- `answers = {}`
- `asked_questions = []`
- `remaining_plans = data.plans`
- `recommendations = []`

---

### Block 3 — Validate / compute completeness
**Goal:** ensure every plan row has:
- `null_key_count`
- `completeness_score`

**If you load `plans.json` from this package:**
- These fields already exist. Just validate presence.

**If you load custom data:**
- Compute:
  - `null_key_count = count_nulls(KEY_FIELDS)`
  - `completeness_score = (len(KEY_FIELDS)-null_key_count)/len(KEY_FIELDS)`
- KEY_FIELDS must match `compute_completeness.py`:
  - plan_tier, hospital_cover, outpatient_cover, gp_visits, maternity_cover,
    mental_health, overseas_emergency, semi_private_room, private_room, excess_required

---

### Block 4 — Ask-next loop (adaptive questionnaire)
Repeat until stopping condition:

**Stopping conditions (choose one):**
- Remaining plans ≤ N (e.g., 15) and score separation is strong
- User answered ≥ MaxQuestions (e.g., 6–8)
- User clicks “Show recommendations now”

**4.1 Choose next question**
- Consider unanswered questions only.
- Compute `effective_priority` (from question bank formula):
  - base_priority
  - + expected_info_gain (how much it splits remaining_plans)
  - + popularity_score (from aggregated analytics; default 0.5)
  - − friction_score (drop-off; default 0.2)

**4.2 Ask question**
- Show `question_text` + `answers` as buttons/options.
- Show `helper_text` as an expandable “Why I’m asking this”.

**4.3 Save answer**
- `answers[question_id] = user_answer`
- Append to `asked_questions`

**4.4 Update “Your Answers” panel**
Render a compact table:
| Topic | Answer | Change |
|---|---|---|
Include edit buttons to revise an answer (re-run filtering/scoring).

---

### Block 5 — Apply elimination (NULL-safe)
Apply two kinds of rules:

1) **Question-driven elimination rules** (`question_bank.json`)
- For must-have logic: eliminate only if value is definitively incompatible.
- If plan field is NULL → keep the plan and set `verification_needed = true`.

2) **Global hard filters** (`scoring_spec.json`)
- Same NULL-safe behavior.

Result:
- update `remaining_plans`

---

### Block 6 — Score plans + tie-break
Compute score per plan using `scoring_spec.json`:

- Feature scoring maps booleans/enums to points
- Apply tier multiplier (from Q_PRICE_POSTURE)
- NULL contributes 0 points (unknown)

**Tie-break rules** (must implement):
1. Highest score
2. If within 5 points → prefer higher `completeness_score`
3. If still tied → prefer fewer verification flags (NULLs on mapped must-have fields)

---

### Block 7 — Build explainable recommendations
Return Top 3 (or Top 5) plans. For each:

**Required fields to show**
- Plan name + insurer
- Fit score (relative)
- Matched must-haves
- Top 3 drivers (largest weight contributions)
- Trade-offs vs runner-up
- Source link: `source_url`
- **Verification needed** badge if key fields are NULL

---

### Block 8 — Feedback + anonymous telemetry logging
Ask:
- “Was this helpful?” (yes/no)
- “Which plan did you click/choose?” (optional)

**POST** `session_analytics` using schema in `session_analytics_schema.json`
- Store only:
  - questions asked
  - drop-off question
  - plan IDs presented
  - plan clicked
  - satisfaction
  - time-to-recommendation
  - (optional) presented plan completeness scores

**STRICT RULE:** do not store conversation text or health/personal details.

---

### Block 9 — Post-session stats panel (new)
After logging, show a stats panel using `post_session_stats_panel.md`.

**Inputs required:**
- `plan_count` (e.g., 272)
- `avg_completeness`
- `top_questions` / `bottom_questions`
- `deltas_since_last_release`

These come from **aggregated telemetry** (see Optimization Cycle).

---

## 4) Optimization cycle (offline, after N sessions)

Run daily/weekly depending on traffic.

### Step 1 — Aggregate telemetry
Compute per question:
- `avg_info_gain`
- `dropoff_rate`
- `path_success` (clicked plan / satisfied)

### Step 2 — Update question priorities
Update `question_bank.json`:
- Increase effective priority for:
  - high info gain
  - low drop-off
  - strong path success
- Decrease for:
  - low info gain
  - high drop-off

### Step 3 — Publish new question bank
Deploy new `question_bank.json` (version bump).

### Step 4 — Report changes
Compute rank deltas vs previous:
- moved up / moved down
Populate the post-session stats panel.

---

## 5) Data enrichment workflow (to reduce stubs)

Follow `data_enrichment_checklist.md`:
1. Replace index `source_url` with plan-specific PDF/page.
2. Populate key fields first (hospital_cover, plan_tier, outpatient, maternity, mental, overseas).
3. Run `compute_completeness.py` to refresh completeness.
4. Redeploy updated `plans.json`.

---

## 6) Minimal compliance wording (used in consent gate)
The canonical consent text is in `compliance_statement.md`. Keep it short and unambiguous:
- no storage of payloads
- optional health data with explicit consent
- anonymous telemetry only
- decision-support disclaimer

---

## 7) “Done” definition (acceptance criteria)
- User can complete a session in ≤ 6–8 questions (typical case).
- Recommendations always include:
  - explanation + source URLs
  - verification badge when needed
- No payload storage; telemetry is anonymous and minimal.
- Post-session stats panel is shown and reflects latest aggregated metrics.