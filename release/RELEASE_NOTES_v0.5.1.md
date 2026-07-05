# Release v0.5.1 (2026-07-05) — Maintenance & Cleanup

This release contains maintenance, cleanup, and a small frontend tweak to display verb `forms`.

Highlights
- Archive and cleanup: moved generated backups, one-off reports, and experimental scripts into `archive/cleanup_20260705/` with an `INDEX.md` for traceability.
- Dataset validation: ensured `data/vocabulary.json` is canonical, IDs sequential (1..759), kept an intentional duplicate `ősz` per policy.
- Deterministic fixes applied: array sorting (`family`/`related`), deduplication (with allowed exceptions), renumbering, controlled infinitive→stem linkages, splitting ambiguous combined entries.
- Stubs: unresolved references were preserved as `data/stubs_created.json` (stubs excluded from the canonical dataset as requested).
- Frontend: `forms` are now shown in the word details panel (`js/app.js` patch).
- Reports: generated reports for each operation and archived them.

Known issues / Deferred work
- Cross-reference missing entries remain (~1461) and are intentionally left as a manual-triage backlog.

Artifacts
- Dataset: `data/vocabulary.json` (759 entries, IDs 1..759)
- Archive: `archive/cleanup_20260705/` (backups, reports, experimental scripts)
- Validation report: `docs/consistency_report.md`
- Release checklist: `docs/release_checklist.md`

Notes for maintainers
- If you want to publish a GitHub Release, create a release on tag `v0.5.1` and paste this file as release notes. The archive contains all intermediate backups if rollback is needed.

Commands run locally
```bash
git tag -a v0.5.1 -m "v0.5.1 — maintenance & UI fix (2026-07-05)"
git push origin refs/tags/v0.5.1
```
