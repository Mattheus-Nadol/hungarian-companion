Accessibility audit & quick checklist

Run automated checks
- Use Lighthouse (Chrome DevTools) -> Accessibility
- Use axe DevTools or axe-core CLI/pa11y for automated rules

Checks implemented in this commit
- Panels marked with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
- Panel headings include an id `panel-title-<id>` to satisfy `aria-labelledby`.
- Close button marked `aria-label="Close details"` and receives focus when panel opens.
- Raw JSON toggle button includes `aria-expanded` and `aria-controls`; updated in `toggleRawJson()`.
- Keyboard handlers: `Enter`/`Space` open cards; `Escape` closes; `Tab`/`Shift+Tab` trapped inside dialog.
- Focus is restored to the originating card after collapse.

Manual checks to run
1. Open the app in Chrome and run Lighthouse accessibility audit.
2. Tab through the Explore list, open a card with Enter, ensure focus lands on Close.
3. Press Tab repeatedly — focus should cycle within the dialog.
4. Press Escape — dialog should close and focus should return to the card.
5. Run axe DevTools extension and fix any remaining violations.

Notes
- For CI integration consider adding `pa11y` or `axe-core` GitHub Action for automated pull request checks.
