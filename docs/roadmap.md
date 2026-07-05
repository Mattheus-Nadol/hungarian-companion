# Hungarian Companion — Roadmap

This document describes the planned releases, goals and acceptance criteria for the hungarian-companion app. The project follows a strict rule:

> Each minor release introduces exactly one major feature — no unrelated scope creep.

Use this roadmap to plan work, open issues, and author PRs. Keep each release small and testable.

---

## Project vision
An interactive companion for learning Hungarian with:
- searchable vocabulary
- grammar reference and word families
- quizzes and review
- an approachable UI for learners

Repository layout (reference)
```
hungarian-companion/
├── index.html
├── README.md
├── css/
├── js/
├── data/
├── assets/
└── docs/
```

---

## Versioning & release policy
- Version format: `vMAJOR.MINOR` (e.g. `v0.4`)
- Each MINOR release = one major feature.
- Each release must have:
  - A scoped set of tasks/PRs (issue(s) linked).
  - Tests / manual QA steps.
  - A clear "Definition of Done" and one short changelog entry.
- Branch: create feature branches named `feature/v0.4-explorer` (or release branches `release/v0.4`).
- PRs should target `main`. Use PR title: `v0.4 — Explorer`.

---

## Release list (planned)
Note: adjust priorities as you learn from users.

- v0.1 — Project scaffolding
  - Goal: Repo structure, basic index.html, css/style.css, data folder with sample vocabulary.
  - Deliverables: minimal UI shell, one sample JSON, README.
  - DoD: app loads, fetch succeeds, CI (if any) passes.

- v0.2 — Static vocabulary view
  - Goal: Show vocabulary list read from JSON.
  - Deliverables: list/grid of words, simple search (client-side).
  - DoD: search finds matches, entries rendered, no JS errors.

- v0.3 — SPA architecture + routing
  - Goal: Move to single page app and add simple hash routing.
  - Deliverables: navigation (home, explore, learn, review), deep links.
  - DoD: navigation works, direct links like `#/word/42` load correctly.

- v0.4 — Explorer (search + discovery)
  - Goal: Full Explore screen: search by fields, filters, pagination/virtualization (if needed).
  - Deliverables:
    - Search limited to selected fields (hu/en/pl).
    - Filtering UI (type, tags).
    - Word list component with accessible cards.
  - DoD:
    - Search and filters applied client-side show correct results.
    - Performance acceptable for current dataset size.
    - Keyboard navigation and basic accessibility.
    **Status:** Partial — core Explore UI and search implemented; filtering UI for `type`/`tags` not yet added.

- v0.5 — Word Card (expandable, details, related)
  - Goal: Per-word details view embedded in cards.
  - Deliverables:
    - Expand-in-place card UI.
    - Related links open referenced words.
    - Raw JSON toggle for debugging.
  - DoD:
    - Expand/collapse works with smooth animation and no stray scroll.
    - Hash deep-linking to a word expands the right card.
    - Unit/manual test steps documented.
  **Status:** Mostly Done — implementation present; QA checklist and release notes added in `RELEASE_NOTES_v0.5.md` and `docs/v0.5-qa.md`. PR created: https://github.com/Mattheus-Nadol/hungarian-companion/pull/9
  DoD:
    - Expand/collapse works with smooth animation and no stray scroll.
    - Hash deep-linking to a word expands the right card.
    - Unit/manual test steps documented (see `docs/v0.5-qa.md`).

- v0.6 — Discovery (recommendations & families)
  - Goal: Add discovery features: word families, random suggestions, "learn next".
  - Deliverables:
    - Families view, suggestions based on tags/frequency.
    - "Practice next" queue generator.
  - DoD:
    - Families load from data/families.json.
    - UI to surface suggested words.

- v0.7 — Grammar reference
  - Goal: Add grammar browsing and small examples.
  - Deliverables:
    - grammar.json + list view + details.
    - Cross-links between grammar rules and example words.
  - DoD: Grammar items searchable and linkable.

- v0.8 — Review (quizzes & progress)
  - Goal: Simple quiz engine and review flow.
  - Deliverables:
    - Create small multiple-choice/flashcard quizzes from quizzes.json.
    - Track mistakes & favorites locally (localStorage).
  - DoD:
    - Quiz flow presents questions, records results, persists favorites.

- v0.9 — UX polish & accessibility
  - Goal: polish animations, keyboard support, aria attributes.
  - Deliverables:
    - Focus management on open panels, escape-to-close, screen reader labels.
  - DoD: passes basic accessibility checklist (keyboard nav, contrast).

- v1.0 — First stable public release
  - Goal: Bundle core features for public use and GitHub Pages hosting.
  - Deliverables:
    - Documented README, example datasets, release notes.
  - DoD:
    - Known critical bugs fixed, basic tests / manual QA completed.

---

## Per-release template (use for each release issue)
Title: vX.Y — <Feature name>

Description:
- Goal:
- Motivation / user story:
- Deliverables:
- Non-goals (explicitly call out what is out of scope):

Tasks (issues / PRs):
- UI: component A
- Data: add/update data file
- Tests / QA: manual test list
- Docs: update README, add docs/roadmap.md entry

Definition of Done:
- All tasks complete
- Acceptance criteria met
- README/docs updated
- PR merged to main

---

## Acceptance criteria examples

v0.4 — Explorer
- Search box finds words matching hu/en/pl fields.
- Filtering by `type` (expression/adjective/noun) works.
- Clickable results open the Word Card (in-place or separate view).
- No console errors on Explore.

v0.5 — Word Card
- Clicking the card expands details in-place.
- Only one card can be expanded at a time.
- Related links open the referenced word.
- URL hash updates to `#/word/<id>` when a card is expanded.
- Raw JSON toggle displays the exact object from the dataset.

v0.8 — Review
- A quiz can be started from Explore or Review.
- Results show correct/incorrect count and persists mistakes to localStorage.
- Favorites can be marked/unmarked from card and appear in a Favorites list.

---

## Branching & release workflow
- Feature branch: `feature/v0.5-word-card`
- Open small PRs for each task that belongs to that feature branch.
- When feature is complete, open PR to `main` with description and checklist linked to the release issue.
- Tag releases in Git: `v0.5`.

---

## Testing & QA
- Manual test checklist per release (add to release issue).
- Basic smoke tests to run before merging:
  - App loads (no 500/404 on static assets)
  - Explore renders list and search works
  - Word expand/collapse (if applicable)
- Keep test steps short and reproducible.

---

## Issues / next actions (short list you can start with)
- Create release issue: `v0.5 — Word Card` and link the tasks:
  - Update `js/app.js` to embed per-card panels (DONE).
  - Add CSS transitions for `.card .panel` (DONE).
  - Add acceptance tests and manual QA steps (YOU).
- Create issue: `v0.6 — Discovery` to collect data model and algorithm for suggestions.
- Add CONTRIBUTING.md (minimal) to document branching and PR style.

---

## Contribution notes
- Small, focused PRs are preferred.
- Link PRs to the release issue number.
- Include screenshots / brief gifs for UI changes.
- When adding/changing data, keep sample entries small and representative.

---

## Appendix — Release schedule (suggested)
- Aim for a cadence of 1 release every 1–3 weeks depending on scope.
- Keep the scope narrow: one major feature per release.

---

## Recent updates

- v0.5 implemented: Word Card behavior and Design System are in the repo. PR created: https://github.com/Mattheus-Nadol/hungarian-companion/pull/9
- TASK 4 (validation) and TASK 5 (normalization) completed — reports in `docs/validation_report_task4.md` and `docs/normalization_report_task5.md`.
- Repository hygiene files added: `CONTRIBUTING.md`, PR template, `.github/copilot-agent.yml`, and a smoke-check workflow to validate `data/vocabulary.json` on PRs.

## Next recommended actions

- Merge PR #9 after QA and attach screenshots/gifs for the UI changes.
- Implement Explore filters (`type` and `tags`) to finish v0.4.
- Start v0.6 planning: define `data/families.json` schema and sample entries.
- Improve accessibility (v0.9): add ARIA attributes, keyboard escape-to-close, and run an a11y audit.

If you'd like, I can:
- Draft the release issue for `v0.5 — Word Card` with a checklist ready to paste to GitHub Issues.
- Create a small CONTRIBUTING.md and PR template to enforce the rule (already added; I can refine it).
- Implement the missing Explore filters and open a PR for them.

Tell me which of those you want me to do next and I will proceed.