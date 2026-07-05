#!/usr/bin/env python3
import json
from pathlib import Path
import unicodedata

DATA = Path('data/vocabulary.json')
BACKUP = Path('data/vocabulary_backup_pre_create_stubs.json')
UNRESOLVED = Path('data/unresolved_references_relaxed.json')
STUBS_OUT = Path('data/stubs_created.json')
REPORT = Path('docs/stubs_created_report.md')

if not DATA.exists():
    raise SystemExit('data/vocabulary.json not found')
if not UNRESOLVED.exists():
    raise SystemExit('data/unresolved_references_relaxed.json not found — run resolvers first')

data = json.loads(DATA.read_text())
if not BACKUP.exists():
    BACKUP.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    print(f'Backed up original to {BACKUP}')

unresolved = json.loads(UNRESOLVED.read_text())

# collect unique missing values
missing = []
for item in unresolved:
    v = item.get('value')
    if v and v not in missing:
        missing.append(v)

if not missing:
    print('No missing values to create stubs for.')
    raise SystemExit

# find next id
max_id = max((e.get('id',0) for e in data), default=0)
new_entries = []
for i, hu in enumerate(missing, start=1):
    max_id += 1
    entry = {
        'id': max_id,
        'hu': hu,
        'en': '',
        'tags': [],
        'family': [],
        'related': [],
        'forms': []
    }
    data.append(entry)
    new_entries.append(entry)

# write updated vocabulary
DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2))
STUBS_OUT.write_text(json.dumps(new_entries, ensure_ascii=False, indent=2))

REPORT.parent.mkdir(parents=True, exist_ok=True)
lines = []
lines.append('# Stubs Created Report')
lines.append('')
lines.append(f'Total unresolved items: {len(unresolved)}')
lines.append(f'Unique values stubbed: {len(new_entries)}')
lines.append('')
lines.append('## Created entries (sample)')
lines.append(json.dumps(new_entries[:200], ensure_ascii=False, indent=2))
REPORT.write_text('\n'.join(lines))

print('Created', len(new_entries), 'stubs; report at', REPORT)
print('Stubs JSON:', STUBS_OUT)
