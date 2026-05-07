# 0013 Testing Strategy

## Status

Accepted

## Context

The app needs fast local checks and a browser smoke path.

## Decision

Use Vitest for schema, reconstruction helper, and narration tests. Use
Playwright for a happy-path smoke test after serving the built `docs/` site.

## Consequences

`make test` and `make smoke` cover the important static-site path without GitHub
Actions.

## Alternatives Considered

Snapshot-heavy visual tests were rejected for v1 because they would be brittle
while the globe styling is still changing.
