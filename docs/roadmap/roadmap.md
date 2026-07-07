# Hungarian Companion — Roadmap (Revised)

This roadmap has been re-evaluated against the current repository state (2026-07-06). It focuses on delivering small, testable increments while preserving data safety and traceability.

---

## High-level project vision
- Interactive companion for learning Hungarian: searchable vocabulary, simple discovery, grammar references, and lightweight review/quizzes.
- Keep releases small: one major feature per minor release.
- Prioritize data safety: backups, reports, and manual triage for ambiguous normalization.

---

## Versioning & release policy (unchanged)
- Version format: `vMAJOR.MINOR` (e.g. `v0.6`).
- Each MINOR must be a scoped, reviewable feature with a Definition of Done (DoD).
- Use short-lived feature branches `feature/vX.Y-name` and open focused PRs to `main`.

---

## Release list (re-scoped and status)
Note: status markers reflect repository state as of 2026-07-06.

- v0.1 — Project scaffolding (Done)
  - DoD: repo scaffold, `index.html`, `css/style.css`, sample `data/` present.

- v0.2 — Static vocabulary view (Done)
  - DoD: vocabulary loads from JSON, basic client-side search, no JS errors.

- v0.3 — SPA architecture & routing (Done)
  - DoD: single-page app with hash deep-links (e.g. `#/word/42`).

- v0.4 — Explorer (Mostly Done)
  - Scope: search by fields (`hu/en/pl`), filtering UI for `type`/`tags`.
  - Notes: core Explore and search merged; filters implemented in recent commits.
  - DoD: client-side search and filters working; performance acceptable.

- v0.5 — Word Card (Done — v0.5.1)
  - Scope: per-word expandable card, related links, raw JSON toggle.
  - DoD: smooth expand/collapse, deep-linking, QA docs and release notes present.

- v0.6 — Discovery MVP (Re-scoped)
  - Rationale: reuse existing `family` and `tag` fields rather than adding a new canonical dataset.
  - Goal (MVP): lightweight discovery to help learners discover related words and a simple practice queue.
  - Deliverables (MVP):
    - Families list derived from existing `family` values (computed index).
    - Per-word family links in the Word Card.
    - Simple "Practice next" generator using `tag` + frequency heuristics.
  - DoD (MVP): families view and per-word links work; practice-next accessible from Explore.

- v0.7 — Grammar reference (Minimal MVP)
  - Scope: add `grammar.json` with a small set of rules/examples and a minimal browser UI.
  - DoD: searchable grammar items with example links into words.

- v0.8 — Review (Scoped)
  - Scope: simple quizzes and progress tracking stored locally.
  - Deliverables: `quizzes.json` samples, UI to start quizzes, persist results in localStorage.
  - DoD: quiz flow operates end-to-end and records basic stats.

- v0.9 — UX polish & accessibility (In progress)
  - Scope: finalize focus management, keyboard handlers, ARIA attributes and a11y checks.
  - DoD: pass basic accessibility checklist (keyboard nav, contrast, escape-to-close).

- v1.0 — First stable public release (Release criteria)
  - DoD:
    - Smoke tests pass (app loads, Explore, card expand)
    - Release notes and rollback plan documented
    - Critical bugs triaged or fixed

---

## Data & maintenance policy (short)
- Always create a timestamped backup in `data/` before any destructive normalization.
- Produce a small `docs/` report for each normalization pass.
- Keep heuristic/experimental scripts in `archive/` and only run them under an explicit review policy.
- Treat unresolved cross-reference items as a manual-triage backlog (currently ~1461 items).

Suggested immediate documentation additions:
- `docs/data-maintenance.md` — describes backup naming, report placement, and triage workflow.
- `docs/release_checklist.md` — minimal smoke-check steps for each release.

---

## Next recommended actions (short-term sprint)
1. Create issue `triage: unresolved cross-references` and define review batches (size: 50–100 items).
2. Implement `feature/v0.6-discovery`: compute families index from `family` field, add families view and practice-next generator.
3. Add `docs/data-maintenance.md` and a short `scripts/validate_families.py` placeholder.
4. Run a quick a11y sweep and add results to `docs/a11y_report.md`.

---

## How to contribute / PR guidance (short)
- Small focused PRs (one change per PR).
- Link PRs to the release issue and include a short QA checklist.
- When changing data, include: backup file, normalization script used, and `docs/` report.

---

If you approve, I will commit these edits to `docs/roadmap.md`, open the triage issue, and create branch `feature/v0.6-discovery` with a minimal families index script and UI stub. Otherwise tell me which edits you want adjusted.
