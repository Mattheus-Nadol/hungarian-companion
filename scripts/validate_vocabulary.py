#!/usr/bin/env python3
import json
from pathlib import Path

data_path = Path('data/vocabulary.json')
out_path = Path('docs/reference/consistency_report.md')
if not data_path.exists():
    raise SystemExit('data/vocabulary.json not found')

data = json.loads(data_path.read_text())

ids = [e.get('id') for e in data]
hus = [e.get('hu') for e in data]

issues = []

# ID checks
if len(ids) != len(set(ids)):
    issues.append(f'- Duplicate id values detected: total {len(ids)} ids, unique {len(set(ids))}')

# Check sequential starting at 1
sorted_ids = sorted(ids)
if sorted_ids[0] != 1 or sorted_ids[-1] != len(sorted_ids) or sorted_ids != list(range(1, len(sorted_ids)+1)):
    issues.append(f'- IDs are not sequential 1..N (min {sorted_ids[0]}, max {sorted_ids[-1]})')

# Duplicate hu lemmas
from collections import defaultdict
hu_map = defaultdict(list)
for e in data:
    hu_map[e.get('hu')].append(e.get('id'))
dups = {k:v for k,v in hu_map.items() if len(v)>1}
if dups:
    issues.append(f'- Duplicate `hu` lemmas found: {len(dups)} (examples: {list(dups.items())[:5]})')

# Array ordering checks (family, related, tags)
not_sorted = []
for e in data:
    for key in ('family','related','tags'):
        if key in e and isinstance(e[key], list) and len(e[key])>1:
            arr = e[key]
            if arr != sorted(arr, key=lambda s: s.lower()):
                not_sorted.append({'id':e['id'],'hu':e['hu'],'field':key,'sample':arr[:5]})

if not_sorted:
    issues.append(f'- Array fields not alphabetically sorted in {len(not_sorted)} entries (sample: {not_sorted[:5]})')

# Cross-reference checks: family/related should exist as hu values (allow missing)
missing_refs = []
hu_set = set(hus)
for e in data:
    for key in ('family','related'):
        for val in e.get(key,[]):
            if val and val not in hu_set:
                missing_refs.append({'id':e['id'],'hu':e['hu'],'field':key,'missing':val})

if missing_refs:
    issues.append(f'- Cross-reference missing entries: {len(missing_refs)} (sample: {missing_refs[:5]})')

# Output report
report = ['# Consistency Report', '', f'Total entries: {len(data)}', '']
if not issues:
    report.append('No issues found. ✅')
else:
    report.append('Issues found:')
    report.extend(issues)

out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text('\n'.join(report))
print('\n'.join(report))
print('\nReport written to', out_path)
