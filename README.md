# 🇭🇺 Hungarian Companion

A personal web-based companion for learning Hungarian.

This project is designed to grow alongside my Hungarian journey. Instead of using generic flashcards, it focuses on understanding patterns, word families, grammar, and practical usage.

## Features

- 📖 Vocabulary Explorer
- 🌳 Word Families
- 📚 Grammar Reference
- 🧠 Interactive Quizzes
- 🔍 Smart Search
- 📈 Learning Progress

## Philosophy

The goal is not to memorize isolated words, but to build intuition by discovering connections between vocabulary, grammar, and real usage.

## Tech Stack

- HTML
- CSS
- JavaScript

No frameworks, no backend, no installation required.

## Roadmap

### v1
- Vocabulary cards
- Search

### v2
- Interactive quizzes

### v3
- Word families

### v4
- Grammar explorer

### v5
- Learning statistics

---

Built as a personal learning companion.

## Development & Deployment

- Local dev server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

- Accessibility checks (run locally):

```bash
# axe-core (example, needs chromedriver management)
npx @axe-core/cli http://localhost:8000 --save a11y-report.json

# or pa11y (no chromedriver required):
npx pa11y http://localhost:8000 --reporter json > pa11y-root.json
```

- Deployment: the site is published from the `main` branch (GitHub Pages). Do not add an automatic Pages deploy workflow that also runs on `push` to `main` — Pages is configured to deploy from `main` in repository settings.

If you prefer workflow-driven deployments, we can switch to a `gh-pages` branch and keep a release-driven deploy workflow.

## Release notes

Release notes are stored in the `releases/` folder at the repository root. When creating a new release:

- Add a `releases/RELEASE_NOTES_vX.Y.md` file (optional).
- Push an annotated tag (`vX.Y`) — the CI workflow will prefer the `releases/` file for the release body and fall back to a root `RELEASE_NOTES_vX.Y.md` or the tag message.

This keeps the repository root tidy while keeping release history visible and versioned.
