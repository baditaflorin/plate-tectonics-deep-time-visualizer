# 0012 Metrics And Observability

## Status

Accepted

## Context

Static Pages has no server-side metrics.

## Decision

Do not add analytics in v1. Validate health through local tests, Playwright
smoke, and Pages availability checks.

## Consequences

The app collects no usage data.

## Alternatives Considered

Plausible or a Cloudflare Worker beacon was rejected because usage analytics are
not required for v1 success.
