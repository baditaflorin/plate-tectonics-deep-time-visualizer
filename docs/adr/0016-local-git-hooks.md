# 0016 Local Git Hooks

## Status

Accepted

## Context

The project must not use GitHub Actions, so local hooks enforce checks.

## Decision

Use plain `.githooks/` wired by `make install-hooks`. Hooks run lint,
typecheck, gitleaks, Conventional Commits validation, tests, build, and smoke.

## Consequences

Contributors must install hooks locally. The commands are also exposed through
Makefile targets.

## Alternatives Considered

Lefthook was rejected because a plain hook directory is enough for v1.
