#!/usr/bin/env python3
"""Generate a families index from data/vocabulary.json.

Output: data/families_index.json with structure:
{
  "family-slug": {
    "name": {"hu": "...", "en": "..."},
    "members": [id, id, ...]
  },
  ...
}

This script is conservative: it only indexes explicit `family` fields found on entries.
"""
import json
import os
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(__file__))
VOCAB = os.path.join(ROOT, "data", "vocabulary.json")
OUT = os.path.join(ROOT, "data", "families_index.json")


def slugify(s: str) -> str:
    return s.strip().lower().replace(" ", "-")


def main():
    with open(VOCAB, "r", encoding="utf-8") as f:
        vocab = json.load(f)

    families = defaultdict(lambda: {"name": {}, "members": []})

    for idx, item in enumerate(vocab, start=1):
        # respect explicit numeric id if present, otherwise use position
        vid = item.get("id") or idx
        fam = item.get("family")
        if not fam:
            continue
        # family may be a string or array; normalize to list
        if isinstance(fam, list):
            fams = fam
        else:
            # support comma-separated or newline-separated strings
            if isinstance(fam, str) and ("\n" in fam or "," in fam):
                parts = [p.strip() for p in fam.replace('\n', ',').split(',') if p.strip()]
                fams = parts
            else:
                fams = [fam]

        for f in fams:
            key = slugify(f)
            families[key]["name"]["hu"] = f
            families[key]["members"].append(vid)

    # sort members and convert defaultdict to normal dict
    out = {k: {"name": v["name"], "members": sorted(list(set(v["members"])))} for k, v in families.items()}

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"Wrote {OUT} with {len(out)} families")


if __name__ == "__main__":
    main()
