# Contributing

- Branch name: `feature/<vX.Y>-short-name` or `fix/<area>-short`.
- PR title: `vX.Y — <Feature>` or `fix(<scope>): short description`.
- Small focused PRs preferred. Link PRs to the release issue (e.g. Issue #1).
- Run local smoke check: `python3 -m json.tool data/vocabulary.json`
- Reviewers: request one reviewer before merging.
- Agents / bots: create draft PRs only (see .github/copilot-agent.yml).
