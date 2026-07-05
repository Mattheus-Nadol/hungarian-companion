#!/usr/bin/env python3
import re
import json
from pathlib import Path
import unicodedata

VOC = Path('data/vocabulary.json')
MERGED = Path('data/vocabulary_merged.md')
REPORT = Path('docs/check_vocab_against_merged_report.md')

if not VOC.exists():
    raise SystemExit('data/vocabulary.json not found')
if not MERGED.exists():
    raise SystemExit('data/vocabulary_merged.md not found')

v = json.loads(VOC.read_text())

def normalize(s):
    s = (s or '').lower().strip()
    s = unicodedata.normalize('NFD', s)
    s = ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')
    s = ''.join(c for c in s if c.isalnum() or c.isspace() or c in "'-")
    s = s.replace('_',' ')
    return s

# ID checks
ids = sorted([e.get('id') for e in v if isinstance(e.get('id'), int)])
min_id = ids[0] if ids else None
max_id = ids[-1] if ids else None
expected = list(range(1, max_id+1)) if max_id else []
missing_ids = [i for i in expected if i not in ids]

# duplicates
hu_map = {}
for e in v:
    hu = e.get('hu')
    if isinstance(hu, str):
        hu_map.setdefault(hu, []).append(e.get('id'))
dups = {k:ids for k,ids in hu_map.items() if len(ids)>1}

# parse merged file for lemmas
merged_text = MERGED.read_text()
merged_hu = set()

# capture New Entries table rows starting with ID
for m in re.finditer(r'^\|\s*(\d+)\s*\|\s*([^|\n]+)\s*\|', merged_text, flags=re.MULTILINE):
    hu = m.group(2).strip()
    merged_hu.add(hu)

# capture Already in Database table rows: rows with three leading columns
for m in re.finditer(r'^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|', merged_text, flags=re.MULTILINE):
    extracted = m.group(1).strip()
    matched = m.group(2).strip()
    merged_hu.add(extracted)
    merged_hu.add(matched)

# compare merged vs vocabulary
voc_hu = set(e.get('hu') for e in v if isinstance(e.get('hu'), str))
voc_norm = {normalize(h):h for h in voc_hu}

missing_from_vocab = []
for h in sorted(merged_hu):
    if h in voc_hu:
        continue
    if normalize(h) in voc_norm:
        continue
    missing_from_vocab.append(h)

# language-ish checks
empty_en = [e for e in v if not e.get('en')]
hu_with_digits = [e for e in v if isinstance(e.get('hu'), str) and re.search(r'\d', e.get('hu'))]
# suspicious: characters outside common Latin + accents, spaces, hyphen, apostrophe
hu_suspicious = [e for e in v if isinstance(e.get('hu'), str) and re.search(r"[^\w\s\-\u00C0-\u017F']", e.get('hu'))]

report_lines = []
report_lines.append('# Vocabulary vs Merged Check')
report_lines.append('')
report_lines.append(f'Total vocabulary entries: {len(v)}')
report_lines.append(f'Min ID: {min_id}, Max ID: {max_id}')
report_lines.append(f'Missing IDs in 1..{max_id}: {len(missing_ids)}')
if missing_ids:
    report_lines.append('Sample missing IDs: ' + ', '.join(str(x) for x in missing_ids[:50]))
report_lines.append('')
report_lines.append(f'Duplicate `hu` lemmas: {len(dups)}')
if dups:
    sample_dups = list(dups.items())[:10]
    report_lines.append('Sample duplicates: ' + json.dumps(sample_dups, ensure_ascii=False))
report_lines.append('')
report_lines.append(f'Parsed lemmas from {MERGED.name}: {len(merged_hu)}')
report_lines.append(f'Vocabulary `hu` count: {len(voc_hu)}')
report_lines.append(f'Merged lemmas missing from vocabulary: {len(missing_from_vocab)}')
if missing_from_vocab:
    report_lines.append('Sample missing lemmas: ' + json.dumps(missing_from_vocab[:80], ensure_ascii=False, indent=2))
report_lines.append('')
report_lines.append('Language-sanity checks:')
report_lines.append(f'Entries with empty English translation: {len(empty_en)}')
report_lines.append(f'Entries with digits in `hu`: {len(hu_with_digits)}')
report_lines.append(f'Entries with suspicious characters in `hu`: {len(hu_suspicious)}')
if hu_suspicious:
    report_lines.append('Sample suspicious `hu`: ' + json.dumps([e.get('hu') for e in hu_suspicious[:50]], ensure_ascii=False))

REPORT.parent.mkdir(parents=True, exist_ok=True)
REPORT.write_text('\n'.join(report_lines))
print('\n'.join(report_lines))
print('\nWrote report to', REPORT)
