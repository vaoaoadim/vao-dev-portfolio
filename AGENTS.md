# Agent Instructions

## Scope

- The application is `site/` (React 19 + Vite).
- Make the requested change directly. Touch only relevant files and preserve changes made by the owner or another agent.
- Do not redesign the interface, replace assets, change public copy, add features, deploy, or run broad cleanup unless the owner explicitly asks.
- Visual direction belongs to the owner. Implement a visual change only from an explicit request or supplied reference.

## Fast workflow

1. Read this file, the closest nested `AGENTS.md`, and the files affected by the request.
2. Inspect the existing implementation, make the smallest complete change, and handle the directly related error or edge state.
3. Run the smallest relevant verification. Do not run research, design audits, browser sweeps, full builds, or exhaustive tests unless the change requires them or the owner asks.
4. Report changed files and the verification actually performed.

## Commands

Run commands from `site/`:

| Need | Command |
| --- | --- |
| Local development | `npm run dev` |
| Production build | `npm run build` |
| Hosting packaging test | `npm run test:sites` |

- Use `npm run build` only for build, packaging, dependency, or owner-requested verification.
- Never reset, checkout, or delete files outside the explicitly requested scope.

## Skills

- Use a local skill only when its description directly matches the request. Do not perform a global skill preflight.
- `gsap-react` is for explicitly requested React animation. `agents-md` is for maintaining these instructions.

## Handoff

| Need | File |
| --- | --- |
| Project overview and setup | `README.md` |
| Current implementation and safe-change rules | `docs/AI_HANDOFF.md` |
| Website-specific scope | `site/AGENTS.md` |
