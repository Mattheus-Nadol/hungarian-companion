# Contributing

- Branch name: `feature/<vX.Y>-short-name` or `fix/<area>-short`.
- PR title: `vX.Y — <Feature>` or `fix(<scope>): short description`.
- Small focused PRs preferred. Link PRs to the release issue (e.g. Issue #1).
- Run local smoke check: `python3 -m json.tool data/vocabulary.json`
- Reviewers: request one reviewer before merging.
- Agents / bots: create draft PRs only (see .github/copilot-agent.yml).

Agent / bot PR handling
- Agents and automation tools MUST create draft PRs and NOT enable auto-merge. This repository enforces that via `.github/copilot-agent.yml` (draft PRs, no auto-merge).
- Reviewers: treat agent-created PRs as suggestions — verify changes manually, run tests, and convert to a regular PR when ready to merge.
- If an agent opens a PR against `main`, do NOT merge without human review and at least one approval.

If you want stricter controls, consider adding branch protection rules on `main` (require PR reviews and status checks).
