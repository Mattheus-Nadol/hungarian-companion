#!/usr/bin/env python3
import json
from pathlib import Path

DATA = Path('data/vocabulary.json')
BACKUP = Path('data/vocabulary_backup_pre_renumber.json')
REPORT = Path('docs/renumber_report.md')

if not DATA.exists():
    raise SystemExit('data/vocabulary.json not found')

data = json.loads(DATA.read_text())
if not BACKUP.exists():
    BACKUP.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    print(f'Backed up original to {BACKUP}')

# renumber according to current order
new_data = []
id_map = {}
for i, e in enumerate(data, start=1):
    old_id = e.get('id')
    e['id'] = i
    id_map[old_id] = i
    new_data.append(e)

DATA.write_text(json.dumps(new_data, ensure_ascii=False, indent=2))

REPORT.parent.mkdir(parents=True, exist_ok=True)
lines = []
lines.append('# Renumber IDs Report')
lines.append('')
lines.append(f'Original count: {len(data)}')
lines.append(f'New sequential IDs: 1..{len(new_data)}')
lines.append('Sample ID remapping (first 20):')
sample = list(id_map.items())[:20]
lines.append(json.dumps(sample, ensure_ascii=False, indent=2))
REPORT.write_text('\n'.join(lines))
print('Renumbering complete; report at', REPORT)
