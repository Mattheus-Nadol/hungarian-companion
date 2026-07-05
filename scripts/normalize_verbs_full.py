#!/usr/bin/env python3
"""Normalize verbs by removing conjugated lemma entries when the lemma exists.
- Backup current vocabulary
- For each verb entry whose hu appears to be conjugated and its stem exists as another hu,
  remove the conjugated entry and add it to the lemma's `forms` list (or `notes`).
- Re-number ids and write a report + removed list.
"""
import json
from pathlib import Path
import unicodedata
import re

DATA = Path('data/vocabulary.json')
BACKUP = Path('data/vocabulary_backup_pre_full_normalize.json')
REMOVED = Path('data/removed_conjugations_full.json')
REPORT = Path('docs/normalization_full_report.md')

if not DATA.exists():
    raise SystemExit('data/vocabulary.json not found')

data = json.loads(DATA.read_text())
if not BACKUP.exists():
    DATA.rename(BACKUP)
    data = json.loads(BACKUP.read_text())
    print(f'Backed up original to {BACKUP}')
else:
    print('Backup already exists; proceeding')

# Build hu -> entry map (prefer entries with type 'verb' or shorter id)
hu_map = {}
for e in data:
    hu = e.get('hu','')
    if hu in hu_map:
        hu_map[hu].append(e)
    else:
        hu_map[hu] = [e]

hu_set = set(hu_map.keys())

# Suffix list (common Hungarian conjugation/inflection endings)
suffixes = [
    'ok','ek','ök','om','em','öm','od','ed','öd','sz','unk','ünk','tok','tek','tök',
    'otok','etek','ötök','nak','nek','om','od','d','t','m','uk','ük','ját','jet','ják','jük','juk','ja','je',
    'tam','tál','tunk','tök','tál','tél','tál','tál','ál','él','ni','ni','ni'
]
# remove duplicates and sort by length desc
suffixes = sorted(set(suffixes), key=len, reverse=True)

# helper: normalize string
def normalize(s):
    s = str(s).strip()
    s = unicodedata.normalize('NFC', s)
    return s

removed = []
kept = []
# We'll build mapping for hu -> canonical entry (first in hu_map list)
canonical = {k: v[0] for k,v in hu_map.items()}

for e in data:
    hu = e.get('hu','')
    typ = e.get('type','')
    if typ == 'verb' and hu:
        matched = False
        for s in suffixes:
            if hu.endswith(s) and len(hu) - len(s) >= 1:
                stem = hu[:-len(s)]
                # direct match
                if stem in canonical:
                    target_hu = stem
                    matched = True
                else:
                    # try vowel alternation for last char
                    alt_map = {'a':'á','á':'a','o':'ó','ó':'o','e':'é','é':'e','u':'ú','ú':'u','i':'í','í':'i'}
                    if stem:
                        last = stem[-1]
                        if last in alt_map:
                            alt = stem[:-1] + alt_map[last]
                            if alt in canonical:
                                target_hu = alt
                                matched = True
                if matched:
                    # ensure we are not matching the same entry (i.e., stem is same as hu)
                    if target_hu == hu:
                        matched = False
                    else:
                        # remove this entry and attach form to target
                        removed.append({'from_id': e.get('id'), 'from_hu': hu, 'to_hu': target_hu})
                        # attach to canonical[target_hu]
                        tgt = canonical[target_hu]
                        # prefer `forms` array or `notes`
                        if 'forms' not in tgt:
                            tgt['forms'] = []
                        if hu not in tgt['forms']:
                            tgt['forms'].append(hu)
                        break
        if not matched:
            kept.append(e)
    else:
        kept.append(e)

# deduplicate forms lists
for e in kept:
    if 'forms' in e:
        e['forms'] = sorted(list(dict.fromkeys(e['forms'])))

# renumber ids sequentially
for i, e in enumerate(kept, start=1):
    e['id'] = i

# write files
DATA.write_text(json.dumps(kept, ensure_ascii=False, indent=2))
REMOVED.write_text(json.dumps(removed, ensure_ascii=False, indent=2))

report_lines = [
    '# Full Normalization Report',
    '',
    f'Total original entries: {len(data)}',
    f'Total entries after normalization: {len(kept)}',
    f'Removed conjugated entries: {len(removed)}',
    '',
    '## Sample removals (up to 50):',
    json.dumps(removed[:50], ensure_ascii=False, indent=2)
]
REPORT.parent.mkdir(parents=True, exist_ok=True)
REPORT.write_text('\n'.join(report_lines))
print('Normalization complete')
print(f'Removed {len(removed)} entries; report at {REPORT}')
