# Changelog

## v0.5.1 - Maintenance & Cleanup (2026-07-05)

See RELEASE_NOTES_v0.5.1.md for full details.

- Repository cleanup and archive of generated backups, reports, and experimental scripts
- Canonical validation of `data/vocabulary.json` (759 entries, sequential IDs)
- Deterministic dataset fixes (sorting, deduplication, renumbering, entry normalization)
- Preserved unresolved references as `data/stubs_created.json` (excluded from canonical dataset)
- Frontend: added display of `forms` in the vocabulary details panel
- Generated validation and operation reports
- Added release checklist and archived intermediate artifacts

## v0.5 - Word Card

See RELEASE_NOTES_v0.5.md for full details.

- New: Expand-in-place vocabulary cards on Explore
- Deep linking for `#/word/<id>`
- Raw JSON toggle for inspection
- Mobile-first design system and cache-bust of assets
- Accessibility improvements: keyboard handlers, ARIA, focus trap
- CI: pa11y a11y checks, Playwright UI smoke tests