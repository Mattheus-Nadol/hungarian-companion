#!/usr/bin/env python3
import json
from pathlib import Path
import unicodedata

DATA = Path('data/vocabulary.json')
BACKUP = Path('data/vocabulary_backup_pre_fixrefs.json')
REPORT = Path('docs/reference_fix_report.md')
UNRESOLVED = Path('data/unresolved_references.json')

if not DATA.exists():
    raise SystemExit('data/vocabulary.json not found')

if not BACKUP.exists():
    DATA.rename(BACKUP)
    data = json.loads(BACKUP.read_text())
    print(f'Backed up original to {BACKUP}')
else:
    data = json.loads(DATA.read_text())
    print('Using existing backup')

# helper: normalize string (lower, remove diacritics, strip)
import re

def normalize(s):
    s = s.lower().strip()
    s = unicodedata.normalize('NFD', s)
    s = ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')
    s = re.sub(r"[^\w\s'-]", '', s)
    s = s.replace('_',' ')
    return s

# build mapping from normalized hu -> set of hu values
norm_map = {}
for e in data:
    hu = e.get('hu','')
    n = normalize(hu)
    norm_map.setdefault(n, set()).add(hu)

replacements = []
unresolved = []
changed_count = 0

for e in data:
    changed = False
    for key in ('family','related','tags'):
        if key in e and isinstance(e[key], list) and e[key]:
            # attempt to resolve each value (skip tags for resolving but sort)
            new_list = []
            for val in e[key]:
                if not isinstance(val, str):
                    new_list.append(val)
                    continue
                if key in ('family','related'):
                    if val in [it for sub in norm_map.values() for it in sub]:
                        # exact match exists
                        new_list.append(val)
                    else:
                        n = normalize(val)
                        candidates = norm_map.get(n)
                        if candidates:
                            # choose a canonical form: prefer exact lowercase match or first
                            chosen = None
                            # if candidates has exact val ignoring case
                            for c in candidates:
                                if c.lower() == val.lower():
                                    chosen = c
                                    break
                            if not chosen:
                                chosen = sorted(candidates)[0]
                            if chosen != val:
                                replacements.append({'id': e.get('id'), 'hu': e.get('hu'), 'field': key, 'from': val, 'to': chosen})
                                changed = True
                            new_list.append(chosen)
                        else:
                            unresolved.append({'id': e.get('id'), 'hu': e.get('hu'), 'field': key, 'value': val})
                            new_list.append(val)
                else:
                    # tags: keep as-is
                    new_list.append(val)
            # sort arrays alphabetically case-insensitive
            try:
                sorted_list = sorted(new_list, key=lambda s: s.lower() if isinstance(s,str) else s)
            except Exception:
                sorted_list = new_list
            if sorted_list != e[key]:
                e[key] = sorted_list
                changed = True
    if changed:
        changed_count += 1

# write modified data
DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2))

# write report
report_lines = []
report_lines.append('# Reference Fix Report')
report_lines.append('')
report_lines.append(f'Total entries processed: {len(data)}')
report_lines.append(f'Entries changed: {changed_count}')
report_lines.append('')
report_lines.append('## Replacements made (sample up to 50)')
report_lines.append(json.dumps(replacements[:50], ensure_ascii=False, indent=2))
report_lines.append('')
report_lines.append(f'## Unresolved references: {len(unresolved)} (sample up to 50)')
report_lines.append(json.dumps(unresolved[:50], ensure_ascii=False, indent=2))
REPORT.parent.mkdir(parents=True, exist_ok=True)
REPORT.write_text('\n'.join(report_lines))
UNRESOLVED.write_text(json.dumps(unresolved, ensure_ascii=False, indent=2))
print('Report written to', REPORT)
print('Unresolved written to', UNRESOLVED)
