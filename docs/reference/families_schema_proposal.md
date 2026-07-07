# families.json — schema proposal

Goal
----
Define a small, extensible schema for `data/families.json` to surface "word families" and related-discovery features in v0.6.

Design principles
-----------------
- Compact references: use numeric `id` to reference entries in `data/vocabulary.json`.
- Relation types are explicit and enumerable to keep UI simple.
- Allow optional metadata (tags, examples, notes) for later UX enhancements.
- Keep statements idempotent and reviewable (no destructive changes).

Suggested JSON schema (informal)
--------------------------------
Top-level: array of family objects.

Family object fields:
- `id` (string): stable slug, e.g. "fam-eat".
- `name` (object): display names; at minimum `hu` required. Example: `{ "hu": "enni (rodzina)", "en": "eat family" }`.
- `headword_id` (number | null): preferred canonical word id for the family (references `data/vocabulary.json`). Optional if family is conceptual.
- `members` (array): list of member objects. Each member:
  - `id` (number): vocabulary id.
  - `relation` (string enum): one of `derivative`, `compound`, `lemma`, `inflected`, `variant`, `related`.
  - `note` (string, optional): short note about the relation.
- `tags` (array of strings, optional): e.g. `["food","verb"]`.
- `examples` (array, optional): objects with `id` (vocab id) and optional `sentence` object with `hu`/`en`/`pl`.
- `source` (string, optional): provenance or script that created it.
- `created_at` (ISO date, optional)
- `notes` (string, optional)

Acceptance criteria for v0.6 MVP
--------------------------------
- `data/families.json` exists and is valid JSON.
- UI loads families and displays a compact family card when a word has `family` membership.
- Word detail panel links to its family and lists other members.
- Families UI can show at least 10 sample families.

Example (minimal)
------------------
```json
[
  {
    "id": "fam-eat",
    "name": { "hu": "enni — rodzina", "en": "eat family" },
    "headword_id": 120,
    "members": [
      { "id": 120, "relation": "lemma" },
      { "id": 121, "relation": "inflected", "note": "3rd sing" },
      { "id": 122, "relation": "derivative", "note": "noun: eater" }
    ],
    "tags": ["food","verb"],
    "source": "manual:2026-07-05",
    "created_at": "2026-07-05T12:00:00Z",
    "notes": "Starter family for common food verbs"
  },
  {
    "id": "fam-ősz",
    "name": { "hu": "ősz — rodzina", "en": "autumn family" },
    "headword_id": 400,
    "members": [
      { "id": 400, "relation": "lemma" },
      { "id": 401, "relation": "variant" }
    ],
    "tags": ["season","noun"],
    "source": "import:normalize_vocabulary.py"
  }
]
```

Next steps (implementation plan)
--------------------------------
1. Agree on schema small changes here.
2. Add `data/families_sample.json` with 8–12 families (small set).
3. Implement a lightweight loader in `js/app.js` to show family info in Word Card.
4. Add a simple `Discovery` view that lists families (v0.6 MVP).
5. Add validation script `scripts/validate_families.py` to check `id` references.

If this looks good, I can:
- open an issue `v0.6 — families schema` with this proposal, or
- create `data/families_sample.json` and a branch `feature/v0.6-families` with minimal UI changes.

---
Compiled on 2026-07-05 by assistant.