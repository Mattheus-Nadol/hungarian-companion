# v0.5 — Word Card

## Overview
This release introduces the Word Card feature and a new mobile-first Design System.

## Highlights
- New: Expand-in-place vocabulary cards on the Explore view.
- Deep linking: `#/word/<id>` opens the referenced card on load and supports back/forward navigation.
- Raw JSON: Toggle to view the underlying vocabulary object for debugging/inspection.
- Replaced stylesheet with a mobile-first, minimal design system (typography, spacing, buttons, cards, search).
- Cache-bust: `index.html` updated to force clients to fetch latest CSS/JS assets.

## Why this release
- Improves discovery and readability of vocabulary items.
- Enables direct permalinks to specific words for sharing and testing.
- Lays the groundwork for consistent UI components across the app.

## Files / changes of note
- `js/app.js` — Word Card UI: expand/collapse, hash routing, raw JSON toggle.
- `css/style.css` — New mobile-first CSS Design System (replaces the previous stylesheet).
- `index.html` — cache-busting query params added for css/js (`?v=2`).
- `CONTRIBUTING.md` — contribution guidelines for feature releases.
- `docs/roadmap.md` — v0.5 acceptance criteria added.
- Issue: #1 (v0.5 — Word Card) links the checklist and QA steps.

## Manual QA checklist
1. Open the site and go to `/#/explore` — vocabulary list renders.
2. Click a word card — card expands in-place, shows fields (hu, pl, en, type, pattern, family, related, tags, notes, examples).
3. URL updates to `#/word/<id>`.
4. Refresh while at that hash — the same card opens automatically.
5. Click a related link — referenced card opens inline and hash updates.
6. Toggle "Raw JSON" — object appears/hides.
7. Keyboard navigation: Tab to card header and press Enter — opens the card.
8. No uncaught errors in DevTools console.
9. Check that styling displays as the new Design System (spacing/typography, clear touch targets).

## Known issues / notes
- The design system is CSS-only; if markup lacks specific hooks, minor visual tweaks may be needed (no HTML/JS were changed beyond cache-bust).
- If you see “plain” styling, ensure GitHub Pages serves `main` and clients fetched the latest assets (cache-bust applied).
- Some vocabulary entries have empty/missing fields (renders as empty strings).

## How to roll back
- To remove the tag locally:
  ```bash
  git tag -d v0.5
  git push origin :refs/tags/v0.5
  ```

- To revert the main branch to a previous commit, create a hotfix branch and open a PR; do not force-push to main unless absolutely necessary.

## Credits
Implementation and styling by the project maintainer (Mattheus-Nadol).
