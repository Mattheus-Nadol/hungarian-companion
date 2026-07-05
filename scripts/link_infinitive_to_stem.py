#!/usr/bin/env python3
import json
from pathlib import Path
import unicodedata

DATA = Path('data/vocabulary.json')
BACKUP = Path('data/vocabulary_backup_pre_linkinf.json')
REMOVED = Path('data/removed_infinitives.json')
REPORT = Path('docs/link_infinitive_report.md')

if not DATA.exists():
    raise SystemExit('data/vocabulary.json not found')

data = json.loads(DATA.read_text())

if not BACKUP.exists():
    BACKUP.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    print(f'Backed up original to {BACKUP}')

def normalize(s):
    s = (s or '').lower().strip()
    s = unicodedata.normalize('NFD', s)
    s = ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')
    s = ''.join(c for c in s if c.isalnum() or c.isspace() or c in "'-")
    s = s.replace('_',' ')
    return s

# build normalized map hu_norm -> list of entries
norm_map = {}
hu_map = {}
for e in data:
    hu = e.get('hu','')
    n = normalize(hu)
    norm_map.setdefault(n, []).append(e)
    hu_map[hu] = e

to_remove_ids = set()
removed = []
replacements = {}

# find infinitives ending with 'ni'
for e in list(data):
    hu = e.get('hu','')
    if not isinstance(hu, str):
        continue
    hu_str = hu.strip()
    if hu_str.lower().endswith('ni') and len(hu_str) > 2:
        stem = hu_str[:-2].strip()
        nstem = normalize(stem)
        candidates = norm_map.get(nstem)
        if candidates:
            # choose first candidate that's not the same string
            target = None
            for c in candidates:
                if normalize(c.get('hu','')) == nstem and c.get('hu') != hu_str:
                    target = c
                    break
            if not target:
                target = candidates[0]
            # attach infinitive form to target's forms
            forms = target.setdefault('forms', [])
            if hu_str not in forms:
                forms.append(hu_str)
            # record removal
            to_remove_ids.add(e.get('id'))
            removed.append({'from_id': e.get('id'), 'from_hu': hu_str, 'to_id': target.get('id'), 'to_hu': target.get('hu')})
            replacements[hu_str] = target.get('hu')

# update references replacing removed hu with target hu
for e in data:
    for key in ('family','related'):
        if key in e and isinstance(e[key], list):
            new_list = []
            changed = False
            for val in e[key]:
                if isinstance(val, str) and val in replacements:
                    new_list.append(replacements[val])
                    changed = True
                else:
                    new_list.append(val)
            if changed:
                # dedupe preserving order
                seen = set()
                dedup = []
                for x in new_list:
                    if x not in seen:
                        dedup.append(x)
                        seen.add(x)
                e[key] = dedup

# remove entries by id
data2 = [e for e in data if e.get('id') not in to_remove_ids]

# write outputs
DATA.write_text(json.dumps(data2, ensure_ascii=False, indent=2))
REMOVED.write_text(json.dumps(removed, ensure_ascii=False, indent=2))

REPORT.parent.mkdir(parents=True, exist_ok=True)
lines = []
lines.append('# Infinitive -> Stem Linking Report')
lines.append('')
lines.append(f'Total original entries: {len(data)}')
lines.append(f'Total after linking: {len(data2)}')
lines.append(f'Removed infinitive entries: {len(removed)}')
lines.append('')
lines.append('## Sample removals')
lines.append(json.dumps(removed[:50], ensure_ascii=False, indent=2))
REPORT.write_text('\n'.join(lines))

print('Linking complete')
print('Removed entries written to', REMOVED)
print('Report at', REPORT)
