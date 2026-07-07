# Checklist — Prioritized Tasks

## Critical — Accessibility & Visibility
- Add high-contrast focus outline around clicked tile so active field is obvious.
- Fix related-link color contrast so linked words remain readable against the navy background.
- Ensure mobile Search returns to zoom-out after use (restore viewport scale).
- Estimated effort: small (CSS + small JS changes).

## High — UX Behavior Fixes
- Clicking a `related` word should populate the search input (do not reset whole list).
- On tile “close”, prevent abrupt scroll; preserve viewport position or use smooth transition.
- Make Tag filters collapsible (checkbox list inside a collapsible panel).
- Add “to top” floating button or top-bar control.
- Add A→Z sort control (by first `hu` letter).
- Estimated effort: small→medium (JS event handler changes).

## High — Data Import & Deduplication Automation
- Implement import script that reads datestamped raw notes (e.g., `Raw_notes_YYYY_MM_DD.md`) and:
  - creates new entries with fields: `id`, `hu` (lemma), `pl`, `en`, `type`, `example`, `pattern`, `family`, `related`, `tags`, `forms`, `date_added`.
  - for incoming forms matching existing lemmas, append missing forms into existing `forms` arrays (avoid duplicates).
  - assign new numeric `id`s incrementally (preserve existing order; avoid full resort).
- [x] Provide `--dry-run` default; require explicit `--apply` to write changes.
- [x] Create timestamped backup before writes: `data/vocabulary.json.bak.<ts>`.
- [x] Use machine-action JSON (array of action objects) for per-lemma decisions and auditable applies.
- [x] Respect safety: DO NOT auto-reconstruct infinitives. Instead generate `reports/missing_infinitive.md` for manual review.
- Estimated effort: medium (Python/Node script + tests).

## Medium — Sorting, Examples & IGEKÖTŐ Handling
- Add A→Z sort option to UI (see above).
- For words tagged `IGEKÖTŐ`, ensure examples: affirmative, interrogative, negative, focus; include `hu` and `pl`.
  - If examples missing, flag on import and include template examples for manual review.
- IGEKÖTŐ detection prefixes: `["meg","el","fel","le","ki","be","vissza","át","rá","össze"]`.
- Estimated effort: medium.

## Medium — Grammar Notes & Architecture
- Split RAW notes into two parts (vocabulary vs grammar) using clear criteria (e.g., sentence structure, headers).
- Design `grammar` JSON schema: metadata, title, section, formatted text (Markdown/HTML), example sentences, source/date.
- Add a Grammar UI section with tiles showing formatted grammar rules pulled from `data/grammar_notes.json`.
- Estimated effort: medium.

## Medium — Scripts & Repo Hygiene
- [x] Identify one-off/used-once files in `data/` and `scripts/`. Move confirmed one-off items to `archive/` (preserve backups) or delete after backup.
- [ ] Update `README.md` / `docs/` with an inventory of moved files and reasons.
- Explain purpose of `package.json` (project metadata, scripts, deps) and `package-lock.json` (locked dependency tree). Consider keeping/removing Node artifacts based on JS tooling usage.
- Estimated effort: small→medium.

## Low — CI / Actions Housekeeping
- Audit `.github/workflows/*.yml`: list jobs (accessibility check, UI smoke, data validate, pages deploy, cloud agent). Consolidate or disable redundant jobs; ensure tests run only on relevant events.
- Estimated effort: small→medium.

## Low — Misc / Safety & Tests
- Add tests/assertions for IGEKÖTŐ example generation and forms merging.
- Add tests/assertions for IGEKÖTŐ example generation and forms merging.
- [x] Ensure all import and transform scripts have `--dry-run` and create backups by default.
- [x] Store human-review reports in `reports/` and keep action JSON files for audit and re-application.

---

# Operational Rules (non-negotiable)
- Dry-run default: all import/transform operations must default to dry-run and only write when `--apply` or explicit `apply:"yes"` in action JSON.
- Backup before write: always create `data/vocabulary.json.bak.<timestamp>` (or similarly named backup) before modifying `data/`.
- No automatic infinitive reconstruction: do not attempt to reconstruct missing infinitives automatically. Produce `reports/missing_infinitive.md` with candidates for manual review.
- Per‑lemma consent for `forms`: add or modify `forms` only after explicit per-lemma decision recorded in the action JSON.
- Machine-action format: use a JSON array of action objects (fields: `id` or candidate key, `action` e.g., `create_lemma`/`append_forms`/`skip`, `forms`, `notes`, `apply: "yes"`). Keep actions and dry-run logs in `reports/` for audit.

---

# Agent Implementation Plan (step-by-step)
1. Create `docs/checklist.md` with the prioritized checklist above.
2. [x] Backup: copy `data/`, `scripts/`, and relevant JSON files to `archive/backup_<timestamp>/`.
3. [x] Repo scan: search for candidate one-off files in `data/` and `scripts/` (age, usage, references, `stubs_created.json`). Produce candidate move list for user confirmation.
4. [x] After user confirmation, move/archive selected files (preserve relative structure) into `archive/` and update `README.md` / `docs/` with inventory.
5. UI patches (dry-run PRs / patches):
   - Add CSS focus outline / `:focus-visible` rules for tiles.
   - Adjust related-link color variables for accessible contrast.
   - Update JS: clicking `related` sets search input and triggers filter (preserve other filters).
   - Make Tag filters collapsible.
   - Prevent scroll-jump on close; add A→Z sort and top-button.
   - Run local UI spec tests (`tests/ui.spec.js`) and report regressions.
6. Implement `scripts/import_raw_notes.py`:
   - Conservative parsing of `raw_notes.md` to extract candidate forms and infinitives.
   - Produce a proposals report (`reports/missing_infinitive.md`) and an action JSON (`reports/missing_infinitive_actions.json`).
   - Provide `--dry-run` (default) and `--apply` to write; create backups when applying.
   - Respect per-lemma apply flow: do not modify `forms` unless action JSON explicitly says so.
7. Implement IGEKÖTŐ detection/tagging:
   - Use the prefix list above and add tag `IGEKÖTŐ`.
   - On import, flag candidate igekötő forms and attach to `tags`.
   - Generate or template examples if missing; mark for review.
8. Grammar schema:
   - Create `data/grammar_schema.md` and example `data/grammar_notes.json`.
   - Add UI tiles to show grammar entries.
9. CI audit:
   - Enumerate existing workflows, propose consolidation/disabling for redundant jobs, and ensure baseline checks (accessibility, data smoke, UI smoke) run on relevant triggers.
10. Tests & finalization:
   - Run unit tests, UI specs, and smoke tests; summarize failures and proposed fixes.
   - Commit changes as small, reviewable patches; keep all reports and action JSON under `reports/`.

---

# Files & Locations to Check / Update
- `data/vocabulary.json` (main dataset)
- `data/raw_notes.md` (source raw notes)
- `scripts/` (`import_raw_notes.py`, existing helpers)
- `reports/` (dry-run reports, action JSON)
- `archive/` (backups and moved one-off files)
- `js/app.js`, `js/families.js`, `css/style.css`, `index.html` (UI changes)
- `.github/workflows/*.yml` (CI audit)