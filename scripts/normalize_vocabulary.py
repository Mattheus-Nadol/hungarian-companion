#!/usr/bin/env python3
"""Normalize vocabulary.json to unified schema.

Usage:
  python3 scripts/normalize_vocabulary.py [--apply]

By default does a dry-run and prints a summary + sample of transformed records.
With --apply it creates a timestamped backup and writes the normalized file.
"""
import argparse
import json
import time
from pathlib import Path


def normalize_record(rec):
    # keep original for fallback
    orig = dict(rec)
    out = {}
    # Basic top-level fields
    for k in ("id", "hu", "pl", "en", "type"):
        if k in rec:
            out[k] = rec[k]
    # example: prefer dict with hu/pl
    example = {}
    if "example" in rec and isinstance(rec["example"], dict):
        example = {k: v for k, v in rec["example"].items() if v}
    # support plural 'examples' if present
    if not example and "examples" in rec and isinstance(rec["examples"], list) and rec["examples"]:
        # pick first entry if it's a dict-like
        first = rec["examples"][0]
        if isinstance(first, dict):
            example = {k: v for k, v in first.items() if v}
    if example:
        out["example"] = example

    # pattern: prefer 'pattern' or 'patterns'
    pattern = None
    if "pattern" in rec and rec.get("pattern"):
        pattern = rec.get("pattern")
    elif "patterns" in rec and rec.get("patterns"):
        if isinstance(rec.get("patterns"), list):
            pattern = rec.get("patterns")[0]
        else:
            pattern = rec.get("patterns")
    if pattern:
        out["pattern"] = pattern

    # related: merge 'related' and 'family'
    related = []
    if "related" in rec and isinstance(rec["related"], list):
        related.extend([r for r in rec["related"] if r])
    if "family" in rec and isinstance(rec["family"], list):
        related.extend([r for r in rec["family"] if r])
    if related:
        # dedupe while preserving order
        seen = set()
        out["related"] = [x for x in related if not (x in seen or seen.add(x))]

    # tags
    tags = rec.get("tags") if isinstance(rec.get("tags"), list) else None
    out["tags"] = tags or []

    # notes -> convert to array
    notes = []
    if "notes" in rec:
        n = rec["notes"]
        if isinstance(n, list):
            notes.extend([s for s in n if s])
        elif isinstance(n, str) and n.strip():
            notes.append(n.strip())
    # capture any leftover fields to notes to preserve data
    preserved = {}
    for k, v in rec.items():
        if k in ("id","hu","pl","en","type","example","examples","pattern","patterns","related","family","tags","notes","forms"):
            continue
        preserved[k] = v
    if preserved:
        notes.append("preserved_fields: " + json.dumps(preserved, ensure_ascii=False))
    out["notes"] = notes

    # forms: ensure array
    forms = rec.get("forms")
    if isinstance(forms, list):
        out["forms"] = forms
    elif isinstance(forms, str) and forms.strip():
        out["forms"] = [forms.strip()]
    else:
        out["forms"] = []

    # keep any other original keys under '_original' for audit (non-invasive)
    out["_original"] = orig
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--apply", action="store_true", help="Write normalized file and create backup")
    args = p.parse_args()

    root = Path(__file__).resolve().parents[1]
    data_path = root / "data" / "vocabulary.json"
    if not data_path.exists():
        print("ERROR: data/vocabulary.json not found")
        return 2

    data = json.loads(data_path.read_text(encoding="utf-8"))
    normalized = []
    for rec in data:
        normalized.append(normalize_record(rec))

    print(f"Records found: {len(data)} -> normalized: {len(normalized)}")
    # show sample of first 5 entries compact
    sample = normalized[:5]
    print(json.dumps(sample, ensure_ascii=False, indent=2))

    if args.apply:
        ts = time.strftime("%Y%m%d%H%M%S")
        bak = data_path.parent / f"vocabulary.json.bak.{ts}"
        data_path.replace(bak)
        out_path = data_path
        out_path.write_text(json.dumps(normalized, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Wrote normalized file and backed up original to: {bak}")
    else:
        print("Dry-run complete. To write changes run with --apply")


if __name__ == "__main__":
    raise SystemExit(main())#!/usr/bin/env python3
import json
from pathlib import Path

VOC = Path('data/vocabulary.json')
if not VOC.exists():
    raise SystemExit('data/vocabulary.json not found')

data = json.loads(VOC.read_text())

# Build set of existing heads (lemmas)
heads = {e['hu'] for e in data}

# common Hungarian verb/person suffixes (heuristic)
suffixes = [
    'ok','ek','ök','om','em','öm','od','ed','öd','sz','unk','ünk','tok','tek','tok','tok',
    'tok','tek','tök','otok','etek','ötök','nak','nek','om','om','od','ed','d','t','m','uk','ük',
    'ját','jet','ják','jük','juk','ja','je','ai','ái','i','ad','ed','od'
]
# sort by length desc
suffixes = sorted(set(suffixes), key=len, reverse=True)

removed = []
keep = []

for entry in data:
    h = entry.get('hu','').strip()
    is_verb = entry.get('type','') == 'verb'
    removed_flag = False
    if is_verb and h:
        for s in suffixes:
            if h.endswith(s) and len(h) - len(s) >= 1:
                stem = h[:-len(s)]
                # direct match
                if stem in heads:
                    removed_flag = True
                    break
                # vowel alternation common: a <-> á, o <-> ó, e<->é, u<->ú, i<->í
                alt_map = {'a':'á','á':'a','o':'ó','ó':'o','e':'é','é':'e','u':'ú','ú':'u','i':'í','í':'i'}
                # try changing last char of stem
                if stem:
                    last = stem[-1]
                    if last in alt_map:
                        alt = stem[:-1] + alt_map[last]
                        if alt in heads:
                            removed_flag = True
                            break
    if removed_flag:
        removed.append(entry)
    else:
        keep.append(entry)

# Reassign sequential IDs starting at 1
for i, e in enumerate(keep, start=1):
    e['id'] = i

# Write backup and new file
bak = Path('data/vocabulary_backup_pre_normalize.json')
if not bak.exists():
    VOC.rename(bak)
    print(f'Original file backed up to {bak}')
else:
    print('Backup already exists')

new_content = json.dumps(keep, ensure_ascii=False, indent=2)
Path('data/vocabulary.json').write_text(new_content)

print(f'Removed {len(removed)} entries. Kept {len(keep)} entries.')
if removed:
    print('Sample removed entries:')
    for r in removed[:20]:
        print('-', r.get('id'), r.get('hu'))

# Save details
Path('data/removed_conjugations.json').write_text(json.dumps(removed, ensure_ascii=False, indent=2))
print('Details written to data/removed_conjugations.json')
