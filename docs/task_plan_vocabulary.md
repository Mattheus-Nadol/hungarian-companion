# Hungarian Knowledge Engine - Complete Task Plan

## PROJECT OVERVIEW
Convert raw Hungarian vocabulary notes into a production-quality, multi-layered Knowledge Engine following the established JSON schema and architectural principles.

---

## TASK 1 — Extract Dictionary Entries from Raw Notes

**Status:** In VS Code with Copilot Cloud

### Objective
Convert messy raw Hungarian notes into a clean dictionary lemma list.

### Input
- `data/raw_notes.md` - Unstructured vocabulary with conjugations, grammar notes, Polish/English translations

### Output
- `data/extracted_lemmas.md` - Clean markdown table with dictionary entries only

### Process

#### Step 1: Extract lemmas only (dictionary base forms)
- Filter out: conjugations, inflections, possessive forms, case variations
- Include: nouns, verbs (infinitive), adjectives, adverbs, pronouns, expressions, particles, numerals

#### Step 2: Normalize entries
- Correct spelling errors
- Fix accents and diacritics
- Use standard modern Hungarian
- Verify infinitives for verbs

#### Step 3: Deduplicate
- Remove exact duplicates
- Merge related entries (e.g., "Hogy hívjak" → "hogy hívnak?")
- Keep one representative entry per concept

#### Step 4: Create markdown table
- Columns: Hungarian | English | Polish | Category
- Sort alphabetically by Hungarian
- Approximately 385-410 unique entries expected

### Copilot Prompt (Use in VS Code)

Extract only dictionary lemmas from raw_notes.md

Requirements:
- Remove ALL conjugations (I, you, he/she, we, they forms)
- Remove ALL inflections (possessive forms, case variations -ban, -ben, -t, -ot)
- Remove ALL grammar explanations and notes
- Remove ALL example sentences
- Remove ALL duplicates
- Correct spelling and accents to standard Hungarian

Output format:
Markdown table with 4 columns:
| Hungarian | English | Polish | Category |

Include:
- Nouns (base forms only)
- Verbs (infinitives only)
- Adjectives
- Adverbs
- Pronouns
- Expressions/phrases (keep as units)
- Numerals
- Postpositions
- Conjunctions
- Particles

Sort alphabetically by Hungarian lemma.

### Validation Checklist
- [ ] No conjugated verb forms present
- [ ] No possessive forms present
- [ ] No case-inflected nouns present
- [ ] No duplicate entries
- [ ] All verbs are in infinitive form
- [ ] All accents correct
- [ ] Table properly formatted
- [ ] Approximately 385-410 entries

---

## TASK 2 — Synchronize Extracted Words with Existing Dictionary

**Status:** Pending TASK 1

### Objective
Merge new extracted lemmas with existing `data/vocabulary.json` (currently ~200 entries).

### Input
- `data/extracted_lemmas.md` - TASK 1 output
- `data/vocabulary.json` - Existing vocabulary database

### Output
- `data/vocabulary_merged.md` - Intermediate merged list (for review)
- Updated IDs reference file

### Process

#### Step 1: Load existing JSON
- Identify all existing entries (IDs 1-199+)
- Document current structure and field coverage

#### Step 2: Compare lemmas
- Extract Hungarian column from extracted_lemmas.md
- Cross-reference against existing vocabulary.json
- Identify: duplicates, new entries, conflicts

#### Step 3: Merge strategy
- Keep ALL existing IDs unchanged
- Never modify existing entries (preserve data integrity)
- Add only NEW lemmas starting from next available ID
- Document merge mapping (old ID → merged status)

#### Step 4: Handle conflicts
- If extracted lemma already exists: mark as "already in database"
- If different translation: document discrepancy for review
- If better data available: create merge note (for TASK 3)

#### Step 5: Generate summary
- Total existing entries: X
- Total new entries to add: Y
- Total entries after merge: X + Y
- List of conflicts/discrepancies

### Validation Checklist
- [ ] No existing IDs modified
- [ ] No existing entries deleted
- [ ] New entries start from correct next ID
- [ ] Merge mapping documented
- [ ] All conflicts logged
- [ ] Summary statistics accurate

---

## TASK 3 — Enrich Dictionary Entries

**Status:** Pending TASK 2

### Objective
Fill all empty fields with high-quality, linguistically accurate data using reliable Hungarian language sources.

### Input
- Merged vocabulary list from TASK 2
- Reliable Hungarian language sources:
  - Hungarian dictionaries (Magyar Értelmező Kéziszótár)
  - Grammar references (Hungarian language resources)
  - Linguistic databases

### Output
- Complete, enriched `data/vocabulary.json` with all fields populated

### Fields to Enrich (Per JSON Schema)

Example structure:
{
  "id": 1,
  "hu": "word",
  "pl": "słowo",
  "en": "word",
  "type": "noun",
  "example": {
    "hu": "Example sentence.",
    "pl": "Przykładowe zdanie."
  },
  "pattern": "Pattern description",
  "family": ["related1", "related2"],
  "related": ["synonym1", "antonym1"],
  "tags": ["tag1", "tag2"],
  "notes": "Optional notes"
}

### Process for Each Entry Type

#### For NOUNS:
1. Verify lemma form
2. Research: plural, accusative, possessive base, vowel harmony
3. Determine semantic category
4. Add natural example: "Az ház nagy." / "Dom jest duży."
5. Add tags: [common, everyday, housing, or similar]
6. Add related: [other furniture/places]
7. Pattern: "Noun + postposition" if applicable

#### For VERBS:
1. Verify infinitive form
2. Research: transitivity, vowel harmony, conjugation class
3. Determine if verb accepts definite/indefinite conjugation
4. Generate present tense pattern if relevant
5. Add natural example: "Írni szeretem." / "Lubię pisać."
6. Family: derived forms (megír, leír, felír, etc.)
7. Related: synonyms and antonyms
8. Pattern: "Somebody + verb + [object/complement]"

#### For ADJECTIVES:
1. Verify base form
2. Research: comparative, superlative forms
3. Add adverb derivative if applicable
4. Example: "A ház szép." / "Dom jest piękny."
5. Related: synonyms (szép, güzel, etc.)
6. Tags: [descriptive, gradable, etc.]

#### For ADVERBS:
1. Identify origin if derived
2. Add example: context where typically used
3. Related: related adverbs or base adjective
4. Tags: [manner, time, place, frequency, etc.]

#### For EXPRESSIONS/PHRASES:
1. Keep as complete unit (don't split)
2. Add usage context
3. Generate example: "Jó reggelt kívánok!" / "Życzę dobrego ranka!"
4. Family: related expressions
5. Tags: [greeting, polite, casual, etc.]

### Enrichment Sources
- Hungarian dictionaries: Look up each lemma
- Grammar references: Verify conjugations, declensions
- Linguistic patterns: Study usage in context
- Related words: Build word families and semantic networks
- Your own knowledge: Use Hungarian fluency

### Validation Checklist
- [ ] All entries have English translation
- [ ] All entries have Polish translation
- [ ] Part of speech correctly categorized
- [ ] All examples are natural, everyday Hungarian
- [ ] Verb infinitives verified
- [ ] Noun lemmas verified
- [ ] No invented or fabricated information
- [ ] All fields non-empty (or explicitly null if unknown)

---

## TASK 4 — Validate Dictionary

**Status:** Pending TASK 3

### Objective
Review complete dictionary for consistency, accuracy, and quality.

### Input
- Enriched `data/vocabulary.json` from TASK 3

### Output
- Validation report documenting all issues and corrections
- Corrected `data/vocabulary.json`

### Validation Checks

#### Structure Validation
- [ ] All entries have required fields
- [ ] No missing IDs
- [ ] IDs are sequential (1, 2, 3, ..., N)
- [ ] No duplicate IDs
- [ ] Valid JSON syntax

#### Data Validation
- [ ] No empty required fields (hu, en, pl, type)
- [ ] No duplicate lemmas in `hu` column
- [ ] All `type` values match allowed enum:
  - noun, verb, adjective, adverb, pronoun, expression, particle, conjunction, numeral, postposition, interjection, determiner

#### Language Validation
- [ ] All Hungarian lemmas correctly spelled
- [ ] All Hungarian lemmas have correct accents/diacritics
- [ ] All English translations are natural and accurate
- [ ] All Polish translations are natural and accurate
- [ ] Verb infinitives are correct
- [ ] Noun lemmas are singular (unless plural-only)

#### Semantic Validation
- [ ] English translations match Polish translations in meaning
- [ ] Examples are natural and contextually appropriate
- [ ] Related words are semantically appropriate
- [ ] Tags are relevant and consistent
- [ ] No duplicate tags per entry
- [ ] No duplicate related words per entry

#### Consistency Validation
- [ ] Consistent capitalization across entries
- [ ] Consistent formatting in all text fields
- [ ] Consistent tag naming and usage
- [ ] Example sentences follow pattern: "Hungarian sentence / Polish sentence"

#### Cross-Reference Validation
- [ ] Family entries exist in dictionary (if referenced)
- [ ] Related entries exist in dictionary (if specific)
- [ ] No circular references (A → B → A)
- [ ] Tags match established taxonomy

### Validation Report Template

VALIDATION REPORT - TASK 4
Date: [date]
Total Entries Reviewed: X

## Issues Found

### Critical Issues (Must Fix)
- [ID X] [issue description] → [correction]
- [ID Y] [issue description] → [correction]

### Warnings (Should Review)
- [ID Z] [issue description] → [recommendation]

### Statistics
- Entries with all fields populated: X%
- Entries with examples: X%
- Entries with family: X%
- Entries with related: X%
- Entries with tags: X%

### Summary
Total issues fixed: X
Total warnings logged: Y
Dictionary ready for: [YES/NO]

### Correction Priority
1. **Must fix:** Syntax errors, missing required fields, duplicate IDs
2. **Should fix:** Spelling errors, incorrect translations, inconsistent formatting
3. **Nice to have:** Missing optional fields (family, related, tags)

### Validation Checklist
- [ ] Structure validation complete
- [ ] Data validation complete
- [ ] Language validation complete
- [ ] Semantic validation complete
- [ ] Consistency validation complete
- [ ] Cross-reference validation complete
- [ ] All critical issues resolved
- [ ] Report generated and reviewed

---

## TASK 5 — Normalize Dictionary

**Status:** Pending TASK 4

### Objective
Ensure consistent formatting, structure, and presentation across all entries.

### Input
- Validated `data/vocabulary.json` from TASK 4

### Output
- Normalized, production-ready `data/vocabulary.json`
- Normalization report

### Normalization Standards

#### JSON Structure

{
  "id": 1,
  "hu": "word",
  "pl": "słowo",
  "en": "word",
  "type": "noun",
  "example": {
    "hu": "Sentence.",
    "pl": "Zdanie."
  },
  "pattern": "Pattern description",
  "family": ["related1", "related2"],
  "related": ["synonym1", "antonym1"],
  "tags": ["tag1", "tag2"],
  "notes": "Optional notes"
}

#### Field Formatting Rules

**hu (Hungarian)**
- Lowercase first letter (unless proper noun)
- Use standard Hungarian spelling
- Include accents (á, é, í, ó, ö, ő, ú, ü, ű)
- No trailing spaces
- Single form (infinitive for verbs, singular for nouns)

**pl (Polish)**
- Lowercase first letter (unless proper noun)
- Consistent with Polish orthography
- No trailing spaces
- Use natural Polish terminology

**en (English)**
- Lowercase first letter
- Use natural English phrasing
- No trailing spaces
- Most common meaning listed first

**type**
- Exactly one of: noun, verb, adjective, adverb, pronoun, expression, particle, conjunction, numeral, postposition, interjection, determiner
- All lowercase
- No typos or variations

**example.hu & example.pl**
- Complete, grammatically correct sentences
- Start with capital letter, end with period
- Natural, everyday language
- Consistent pair (both or neither)
- No artificial textbook phrasing

**pattern**
- Clear, concise description
- Use: "X + verb + Y" format where applicable
- No technical jargon unless necessary
- Practical and reusable
- Empty string if no applicable pattern

**family**
- Array of strings (sorted alphabetically)
- Related derivations only (not inflections)
- All entries should exist in dictionary
- No duplicates
- Empty array if no family

**related**
- Array of strings (sorted alphabetically)
- Semantic relationships only
- Mix of synonyms, antonyms, conceptual links
- All entries should exist in dictionary (or be well-known)
- No duplicates
- Empty array if none

**tags**
- Array of lowercase strings (sorted alphabetically)
- From established tag vocabulary
- Relevant to entry
- No duplicates
- 0-5 tags per entry (optimal: 2-4)

**notes**
- Clear, concise explanatory text
- Useful learner information
- Linguistic oddities or exceptions
- No long-form explanations
- Empty string if not needed

#### Indentation & Spacing
- 2-space indentation (consistent)
- No trailing whitespace
- One blank line between entries (in readable format)
- Proper JSON formatting

#### Encoding
- UTF-8 encoding (required for Hungarian diacritics)
- No BOM (Byte Order Mark)
- Line endings: LF (Unix style)

#### Sorting
- By ID (ascending, 1 → N)
- Secondary: by `hu` field (alphabetical)
- No randomization

#### Tag Vocabulary (Standardized)

**Time-related:** daily, morning, evening, night, weekend, holiday, time, clock, date
**Place-related:** home, school, city, nature, building, transport, shopping
**Food-related:** food, drink, meal, breakfast, lunch, dinner, spice, fruit, vegetable
**Body/Health:** body, health, illness, emotion, sense
**Family:** family, kinship, relation
**Work/Career:** work, profession, job, business
**Education:** education, learning, school, study
**Activity:** activity, movement, sport, game, hobby
**Clothing:** clothing, fashion, appearance
**Nature:** weather, animal, plant, season
**Transport:** transport, travel, vehicle
**Communication:** communication, language, expression
**Adjective:** descriptive, quality (only for adjectives)
**Grammar:** grammatical term (only for grammar-related)
**Common:** frequently used, everyday language
**Slang:** informal, colloquial, casual
**Formal:** formal, official, professional
**Polite:** politeness, manners, social
**Emotion:** emotional state, feeling
**Duolingo:** from Duolingo course (if applicable)
**A1/A2/B1/B2:** CEFR level (if known)

### Normalization Process

1. **Script normalization** (if using automated tool)
   - Remove extra whitespace
   - Standardize capitalization
   - Sort all arrays
   - Validate encoding

2. **Manual review**
   - Check each field for consistency
   - Verify all tags are from standard vocabulary
   - Ensure examples are properly paired
   - Confirm family/related entries exist

3. **Quality assurance**
   - Valid JSON syntax
   - All required fields present
   - No unintended empty fields
   - Proper encoding

### Normalization Checklist
- [ ] JSON structure consistent across all entries
- [ ] Field formatting standardized
- [ ] Encoding is UTF-8
- [ ] All tags from standard vocabulary
- [ ] All arrays sorted alphabetically
- [ ] No trailing whitespace
- [ ] Indentation consistent (2 spaces)
- [ ] IDs sequential
- [ ] Sorted by ID
- [ ] Valid JSON (no syntax errors)
- [ ] File size reasonable

### Verification Command (in terminal)

Check JSON validity
cat data/vocabulary.json | python3 -m json.tool > /dev/null && echo "✓ Valid JSON"

Count entries
cat data/vocabulary.json | grep -o '"id"' | wc -l

Check for duplicates
cat data/vocabulary.json | grep '"hu"' | sort | uniq -d

---

## NEXT STEPS (Future Tasks)

### TASK EXTRA — Build Incremental Update Pipeline

Create Python scripts for automated future updates:
- `extract_new_words.py` - Extract lemmas from new raw notes
- `normalize_entries.py` - Normalize entry format
- `compare_dictionary.py` - Compare with existing dictionary
- `enrich_entries.py` - Research and populate fields
- `append_dictionary.py` - Append new entries to JSON
- `validate_dictionary.py` - Automated validation

---

## WORKFLOW SUMMARY

Raw Notes (raw_notes.md)
    ↓
TASK 1: Extract Lemmas → extracted_lemmas.md
    ↓
TASK 2: Merge with existing → merged vocabulary
    ↓
TASK 3: Enrich entries → rich vocabulary.json
    ↓
TASK 4: Validate → error report
    ↓
TASK 5: Normalize → production-ready JSON
    ↓
✓ Complete vocabulary.json (READY FOR USE)

---

## TIPS FOR SUCCESS

### General
- Work one task at a time
- Validate each output before moving to next task
- Keep backup of original files
- Document decisions and conflicts
- Use version control (git commit after each task)

### With Copilot
- Be specific in prompts
- Ask for one thing at a time
- Request validation after processing
- Use "explain" if unclear about results
- Iterate and refine until satisfied

### Quality Assurance
- Always review AI-generated content
- Never trust automatic extraction without verification
- Cross-reference translations against multiple sources
- Test examples by reading them aloud
- Have a native Hungarian speaker review if possible

### Time Management
- TASK 1-2: ~1-2 hours (mostly automated)
- TASK 3: ~3-4 hours (research-intensive)
- TASK 4: ~1-2 hours (review and correction)
- TASK 5: ~30 minutes (automation + review)
- **Total: ~6-9 hours** for complete dictionary

---

## RESOURCES & REFERENCES

### Hungarian Language
- Magyar Értelmező Kéziszótár (Hungarian dictionary)
- Hungarian grammar: https://hungariangrammar.com
- Verb conjugation: https://www.magyarlangtanulas.com

### Tools
- JSON validator: https://jsonlint.com
- VS Code extensions: ESLint, Prettier, Code Spell Checker
- GitHub Desktop or CLI for version control

### Project Files
- `/data/raw_notes.md` - Source material
- `/data/extracted_lemmas.md` - TASK 1 output
- `/data/vocabulary.json` - Main database
- `/data/vocabulary_backup.json` - Safety backup (create before TASK 3)

---

## SUCCESS CRITERIA

By end of all tasks:
- ✅ 385-410+ unique Hungarian lemmas
- ✅ All fields populated with quality data
- ✅ No duplicate entries
- ✅ Consistent formatting and structure
- ✅ Valid, production-ready JSON
- ✅ Ready to integrate with Knowledge Engine layers

---

**Last Updated:** 2026-07-05
**Status:** Ready for TASK 1 in VS Code
**Next Action:** Start TASK 1 in VS Code Copilot Chat with the provided prompt