# Data Maintenance — Policy & Workflow

Purpose
-------
This document describes the minimal, safe workflow for maintaining and normalizing dataset files in `data/` (especially `data/vocabulary.json`). It is written to preserve traceability, make operations reversible, and keep experimental scripts isolated.

Principles
----------
- Never modify `data/vocabulary.json` directly without creating a timestamped backup.
- Each destructive or large-scale automated change must produce a short machine-readable `docs/` report describing what changed and why.
- Keep experimental/heuristic scripts in `archive/` and only run them after explicit review.
- Treat unresolved or ambiguous changes as manual triage items (export as CSV/stub JSON for review).

Backup naming convention
-----------------------
- Use a predictable timestamped filename in `data/`:
  - `data/vocabulary_backup_YYYYMMDD_HHMMSS.json`
  - Example: `data/vocabulary_backup_20260706_143022.json`

Standard workflow (safe normalization)
--------------------------------------
1. Create a backup of the canonical dataset:

```bash
TS=$(date -u +%Y%m%d_%H%M%S)
cp data/vocabulary.json data/vocabulary_backup_${TS}.json
```

2. Run validation to capture current issues and produce a report (example):

```bash
python3 scripts/validate_vocabulary.py --in data/vocabulary.json --out docs/validation_report_${TS}.md
```

3. Run deterministic normalization scripts (one at a time). Each script must:
   - Read from `data/vocabulary.json` or a backup copy.
   - Write a new dataset to `data/vocabulary_normalized_${TS}.json` (never overwrite canonical file directly).
   - Produce a concise `docs/` report describing the edits and counts of changes.

Example pattern:

```bash
python3 scripts/normalize_vocabulary.py --in data/vocabulary.json --out data/vocabulary_normalized_${TS}.json --report docs/normalize_report_${TS}.md
```

4. Review the `docs/` report and, if approved, replace canonical file with the normalized file (preserve the backup):

```bash
mv data/vocabulary.json data/vocabulary_prev_${TS}.json
mv data/vocabulary_normalized_${TS}.json data/vocabulary.json
git add data/vocabulary.json docs/normalize_report_${TS}.md
git commit -m "normalize(vocabulary): apply deterministic fixes ${TS}"
```

5. If normalization introduced regressions, rollback using the backup file and open a follow-up issue describing the problem.

Experimental scripts
--------------------
- Move one-off or heuristic scripts to `archive/` (example: `archive/scripts_experimental/`).
- Tag their outputs clearly (e.g. `data/vocabulary_autoresolves_YYYYMMDD.json`) and never merge those outputs to canonical `data/vocabulary.json` automatically.

Stubs and manual triage
-----------------------
- When automated passes cannot safely resolve references, generate a stub file `data/stubs_created_${TS}.json` and a triage CSV `docs/triage_unresolved_${TS}.csv`.
- Triage process:
  1. Create an issue `triage: unresolved cross-references` and attach the CSV.
  2. Assign small review batches (50–100 items) to reviewers.
  3. Once a batch is reviewed and approved, optionally apply deterministic edits and produce a report.

Reporting template
------------------
Each normalization or validation run should create a short report with:
- `operation`: name of script/command
- `timestamp`: ISO 8601 timestamp
- `input_file`: path
- `output_file`: path (if produced)
- `backup_file`: path
- `summary`: short human summary
- `counts`: JSON object with counts of changes (e.g. `added`, `removed`, `modified`)

Example `docs/normalize_report_20260706_143022.md` header:

```
Operation: normalize_vocabulary.py
Timestamp: 2026-07-06T14:30:22Z
Input: data/vocabulary.json
Output: data/vocabulary_normalized_20260706_143022.json
Backup: data/vocabulary_backup_20260706_143022.json
Summary: Sorted arrays, deduped allowed items, renumbered IDs sequentially (1..759)
Counts: {"modified": 23, "sorted_arrays": 3}
```

QA checklist before committing a normalization
---------------------------------------------
- [ ] Backup created and present in `data/`.
- [ ] Validation run produced a report and shows expected diffs.
- [ ] Scripts used are recorded in the report (script name + commit hash if applicable).
- [ ] A human reviewed the report and approved changes.
- [ ] Commit message references the report and backup filenames.

Automation suggestions
----------------------
- Add a `scripts/run_normalize.sh` wrapper that enforces the backup → run → report → review pattern.
- Add a CI smoke-check workflow that runs `scripts/validate_vocabulary.py` on PRs touching `data/` and uploads the report as an artifact.

Appendix: minimal example commands
---------------------------------
```bash
# create backup
TS=$(date -u +%Y%m%d_%H%M%S)
cp data/vocabulary.json data/vocabulary_backup_${TS}.json

# validate
python3 scripts/validate_vocabulary.py --in data/vocabulary.json --out docs/validation_report_${TS}.md

# normalize (deterministic)
python3 scripts/normalize_vocabulary.py --in data/vocabulary.json --out data/vocabulary_normalized_${TS}.json --report docs/normalize_report_${TS}.md

# review & promote (after approval)
mv data/vocabulary.json data/vocabulary_prev_${TS}.json
mv data/vocabulary_normalized_${TS}.json data/vocabulary.json
git add data/vocabulary.json docs/normalize_report_${TS}.md
git commit -m "normalize(vocabulary): apply deterministic fixes ${TS}"
```

Contact / ownership
-------------------
- Maintain `docs/data-maintenance.md` as part of repository governance.
- Tag the file in PRs that change data-related scripts or procedures.


