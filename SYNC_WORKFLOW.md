# Portfolio synchronization workflow

GitHub repository `vaoaoadim/vao-dev-portfolio` is the canonical copy of this project. The local folder, Remote Codex tasks, and any cloud workspace must converge through Git commits; an uploaded ZIP is only a reference snapshot.

## Before any task

1. Run `git fetch origin`.
2. Inspect `git status --short --branch`.
3. If the branch is behind, update it with `git pull --ff-only` before editing.
4. If another task has uncommitted changes, do not mix work into its files. Finish that task or work on a dedicated `codex/<task>` branch.

## After a completed update

1. Verify the requested change.
2. Stage only the relevant source, asset, test, and documentation files.
3. Create a concise commit describing the outcome.
4. Push the current branch to `origin`.
5. Merge a feature branch into `main` only after review and verification. `main` is the version that every workspace should use as its next starting point.

## Phone and cloud work

- A ChatGPT Project keeps instructions and uploaded files together, but it does not write back into this local folder.
- For actual code changes from a phone, use a supported Remote Codex task where available, or have cloud work produce changes on a dedicated GitHub branch/PR.
- After the branch or PR is merged, return to the computer and run `git pull --ff-only` before continuing locally.
- Do not edit the same file simultaneously in local Codex and cloud work. Use separate branches for parallel changes.

## What is never committed by default

`node_modules`, generated output, temporary audit files, browser profiles, local runtime folders, and package archives are not project source. They must stay out of Git commits unless the owner explicitly requests otherwise.

## Publishing the website

A GitHub push synchronizes code only. It does not publish the public website. Hosting deployment remains a separate, explicitly requested operation.
