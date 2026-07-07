#!/usr/bin/env python3
import json
from pathlib import Path
from collections import defaultdict

VOC_PATH = Path('data/vocabulary.json')
REPORT_PATH = Path('docs/reference/forms_suggestions.md')

if not VOC_PATH.exists():
    raise SystemExit('data/vocabulary.json not found')

data = json.loads(VOC_PATH.read_text(encoding='utf-8'))

# Build lookup of verb lemmas by their 'hu' field
lemmas = {}
for entry in data:
    if entry.get('type') == 'verb':
        hu = entry.get('hu', '').strip()
        if hu:
            lemmas[hu] = entry

# Build set of all verb hu forms for quick lookup
all_verbs = {entry.get('hu', '').strip() for entry in data if entry.get('type') == 'verb' and entry.get('hu')}

# Common Hungarian verb/person suffixes (heuristic)
suffixes = [
    'ok','ek','ök','om','em','öm','od','ed','öd','sz','unk','ünk','tok','tek','tök','otok','etek','ötök',
    'nak','nek','d','t','m','uk','ük','ját','jet','ják','jük','juk','ja','je','ai','ái','i','ad'
]
suffixes = sorted(set(suffixes), key=len, reverse=True)

def possible_stems(word):
    """Generate possible stems by stripping known suffixes."""
    stems = set()
    for s in suffixes:
        if word.endswith(s) and len(word) - len(s) >= 1:
            stems.add(word[:-len(s)])
    return stems

# Vowel alternation map for Hungarian common vowel changes
alt_map = {'a':'á','á':'a','o':'ó','ó':'o','e':'é','é':'e','u':'ú','ú':'u','i':'í','í':'i'}

def vowel_alternations(stem):
    """Generate possible vowel alternations of the last character of a stem."""
    alternates = set()
    if stem:
        last = stem[-1]
        if last in alt_map:
            alternates.add(stem[:-1] + alt_map[last])
    return alternates

# Collect suggestions: lemma hu -> set of suggested forms
suggestions = defaultdict(set)

for lemma_hu, lemma_entry in lemmas.items():
    lemma_forms = set()
    forms_field = lemma_entry.get('forms')
    if isinstance(forms_field, list):
        lemma_forms.update(forms_field)
    elif isinstance(forms_field, str) and forms_field.strip():
        lemma_forms.add(forms_field.strip())

    # Scan all other verbs to find possible inflected forms of this lemma
    for other_hu in all_verbs:
        if other_hu == lemma_hu:
            continue
        # Check if other_hu looks like an inflected form of lemma_hu
        # by checking suffixes and stem matching with vowel alternations
        matched = False
        for s in suffixes:
            if other_hu.endswith(s) and len(other_hu) - len(s) >= 1:
                stem = other_hu[:-len(s)]
                if stem == lemma_hu:
                    matched = True
                    break
                # Check vowel alternation
                for alt_stem in vowel_alternations(stem):
                    if alt_stem == lemma_hu:
                        matched = True
                        break
            if matched:
                break
        if matched:
            if other_hu not in lemma_forms:
                suggestions[lemma_hu].add(other_hu)

# Prepare report lines
report_lines = []
report_lines.append("# Candidate additions to forms[]\n")

affected_lemmas = 0
total_suggestions = 0

for lemma_hu in sorted(suggestions.keys()):
    suggested = sorted(suggestions[lemma_hu])
    if not suggested:
        continue
    lemma_entry = lemmas[lemma_hu]
    forms_field = lemma_entry.get('forms')
    current_forms = []
    if isinstance(forms_field, list):
        current_forms = forms_field
    elif isinstance(forms_field, str) and forms_field.strip():
        current_forms = [forms_field.strip()]
    report_lines.append(f"## Lemma: {lemma_hu}")
    report_lines.append(f"Current forms: {', '.join(current_forms) if current_forms else '(none)'}")
    report_lines.append(f"Suggested additions: {', '.join(suggested)}\n")
    affected_lemmas += 1
    total_suggestions += len(suggested)

report_lines.append(f"---\n\nSummary:")
report_lines.append(f"Affected lemmas: {affected_lemmas}")
report_lines.append(f"Total suggested forms: {total_suggestions}")
report_lines.append("\nNo changes were made to vocabulary.json.")

report_text = "\n".join(report_lines)

# Print the report
print(report_text)

# Save the report to file, creating parent directory if needed
REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
REPORT_PATH.write_text(report_text, encoding='utf-8')
