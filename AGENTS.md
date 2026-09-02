# Site Instructions

- This folder contains the React/Vite website. Keep changes local; do not publish or alter hosting configuration unless asked.
- Preserve existing assets, layout, visual direction, and copy unless the owner explicitly requests a change to them.
- For a requested feature or fix, inspect only the affected source and make the smallest complete implementation.
- Prefer targeted verification. Do not run the full build or Sites test suite unless the change affects build/hosting or the owner asks.

## GitHub synchronization

- GitHub remote `origin` (`vaoaoadim/vao-dev-portfolio`) is the single source of truth for completed website changes.
- Before starting a new implementation, run `git fetch origin` and inspect `git status --short --branch`. Do not build on a stale or diverged branch.
- After each completed, verified update requested by the owner: stage only the files in scope, make one descriptive commit, and push the current branch to `origin`.
- Do not push partial work, unrelated user changes, generated output, dependencies, temporary files, or local tool state. If another task is actively changing the same working tree, finish or coordinate that work before committing.
- Use `main` only for reviewed, working changes. Parallel work must use a dedicated `codex/<task>` branch and merge it into `main` only after verification.
- GitHub push is the required code-sync step; publishing to the public website remains a separate action and still requires an explicit owner request.
- ChatGPT Work projects are reference workspaces, not a bidirectional filesystem sync. For phone edits that change code, use a GitHub-backed branch/PR or a supported Remote Codex task; after a merge, update the local checkout with `git pull --ff-only` before continuing.
