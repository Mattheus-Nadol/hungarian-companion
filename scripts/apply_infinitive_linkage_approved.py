#!/usr/bin/env python3
import json
from pathlib import Path
import unicodedata

DATA = Path('data/vocabulary.json')
BACKUP = Path('data/vocabulary_backup_pre_infinitive_approved.json')
REMOVED = Path('data/removed_infinitives_approved.json')
REPORT = Path('docs/infinitive_linkage_approved_report.md')

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

# approved infinitives (from earlier merged-missing list)
infinitives = [
  "adni","akarni","beszélni","enni","fogni","futni","jönni","kérni",
  "látni","pihenni","repülni","sietni","szeretni","sétálni","tanulni",
  "tudni","táncolni","várni","állni","élni","énekelni","írni","örülni","ülni"
]

# build normalized map hu_norm -> entry
norm_map = {}
hu_map = {}
for e in data:
    hu = e.get('hu')
    if isinstance(hu, str):
        norm_map.setdefault(normalize(hu), []).append(e)
        hu_map[hu] = e

removed = []
changes = []

for inf in infinitives:
    ninf = normalize(inf)
    stem = inf[:-2] if inf.lower().endswith('ni') else None
    nstem = normalize(stem) if stem else None
    # find candidate by normalized stem
    candidates = norm_map.get(nstem) if nstem else None
    candidate = None
    if candidates:
        # pick item whose hu normalized equals stem
        for c in candidates:
            if normalize(c.get('hu')) == nstem:
                candidate = c
                break
        if not candidate:
            candidate = candidates[0]

    if candidate:
        forms = candidate.setdefault('forms', [])
        if inf not in forms:
            forms.append(inf)
            changes.append({'to_id': candidate.get('id'), 'to_hu': candidate.get('hu'), 'added_form': inf})
    # if infinitive exists as standalone entry, remove it
    standalone = None
    for e in list(data):
        if e.get('hu') == inf:
            standalone = e
            break
    if standalone:
        removed.append({'from_id': standalone.get('id'), 'from_hu': standalone.get('hu'), 'merged_to': candidate.get('hu') if candidate else None})
        data = [e for e in data if e.get('id') != standalone.get('id')]

# write updated data
DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2))
REMOVED.write_text(json.dumps(removed, ensure_ascii=False, indent=2))

REPORT.parent.mkdir(parents=True, exist_ok=True)
lines = []
lines.append('# Approved Infinitive Linkage Report')
lines.append('')
lines.append(f'Total infinitives processed: {len(infinitives)}')
lines.append(f'Forms added: {len(changes)}')
lines.append(f'Standalone infinitives removed: {len(removed)}')
lines.append('')
lines.append('## Changes sample')
lines.append(json.dumps(changes[:200], ensure_ascii=False, indent=2))
lines.append('')
lines.append('## Removed sample')
lines.append(json.dumps(removed[:200], ensure_ascii=False, indent=2))
REPORT.write_text('\n'.join(lines))

print('Applied approved infinitive linkage; report at', REPORT)
