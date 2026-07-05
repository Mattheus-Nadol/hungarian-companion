#!/usr/bin/env python3
import json
from pathlib import Path

DATA = Path('data/vocabulary.json')
BACKUP = Path('data/vocabulary_backup_pre_dedupe.json')
REPORT = Path('docs/dedupe_report.md')

if not DATA.exists():
    raise SystemExit('data/vocabulary.json not found')

data = json.loads(DATA.read_text())
if not BACKUP.exists():
    BACKUP.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    print('Backed up original to', BACKUP)

allowed_duplicates = {'ősz'}
seen = set()
kept = []
removed = []

for e in data:
    hu = e.get('hu')
    if not isinstance(hu, str):
        kept.append(e)
        continue
    if hu in seen and hu not in allowed_duplicates:
        removed.append({'id': e.get('id'), 'hu': hu})
        continue
    seen.add(hu)
    kept.append(e)

# renumber sequentially
for i, e in enumerate(kept, start=1):
    e['id'] = i

DATA.write_text(json.dumps(kept, ensure_ascii=False, indent=2))

REPORT.parent.mkdir(parents=True, exist_ok=True)
lines = []
lines.append('# Deduplication Report')
lines.append('')
lines.append(f'Original count: {len(data)}')
lines.append(f'Kept count: {len(kept)}')
lines.append(f'Removed duplicates: {len(removed)}')
lines.append('Sample removed:')
lines.append(json.dumps(removed[:200], ensure_ascii=False, indent=2))
REPORT.write_text('\n'.join(lines))

print('Deduplication complete; report at', REPORT)
