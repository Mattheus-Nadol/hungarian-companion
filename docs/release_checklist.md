# Release checklist — prepared on 2026-07-05

Summary of checks performed prior to release:

- Dataset file: `data/vocabulary.json` — present and reachable via HTTP (smoke-tested via local server).
- Total entries: 759 (IDs 1..759).
- IDs sequential: yes (1..759, no gaps).
- Duplicate `hu` lemmas: 1 (allowed duplicate: `ősz` preserved by policy).
- Cross-reference missing entries: 1461 remaining (deferred/manual triage — intentionally left as backlog).
- Stubs: `data/stubs_created.json` preserved and excluded from `data/vocabulary.json`.
- Backups and generated reports: archived under `archive/cleanup_20260705/` with `INDEX.md`.
- Experimental/heuristic scripts moved to `archive/cleanup_20260705/scripts_experimental/`.
- Frontend UI: `forms` field now displayed in details panel (`js/app.js` update committed).
- Validation report: `docs/consistency_report.md` updated by `scripts/validate_vocabulary.py`.
- Code changes committed and pushed to `origin/main` (commit messages: archive cleanup; UI fix for forms).

Recommended next steps before a public release:

1. Optional: manual triage of unresolved cross-references (CSV generation is available if needed).
2. Run any external CI or accessibility checks you use (not run locally here).
3. Update `RELEASE_NOTES_v0.5.md` if you want to include these maintenance items.
4. Tag the release (e.g., `v0.5.1`) and create a GitHub release noting the scope (cleanup + UI fix).

If you want, I can:
- generate the triage CSV now and attach it, or
- create a release tag and draft GitHub release notes, or
- run additional QA (a11y checks, link verification).
