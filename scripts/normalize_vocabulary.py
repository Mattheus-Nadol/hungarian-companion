#!/usr/bin/env python3
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
