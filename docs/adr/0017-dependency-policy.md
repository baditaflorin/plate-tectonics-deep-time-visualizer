# 0017 Dependency Policy

## Status

Accepted

## Context

The prompt requires battle-tested libraries and no custom reinvention where a
library is appropriate.

## Decision

Use mature frontend libraries for rendering, validation, fetching, testing, and
icons. Keep the reconstruction kernel custom because it is the product-specific
domain boundary.

## Consequences

The dependency graph is modest and auditable with `npm audit`.

## Alternatives Considered

Adding experimental globe packages was rejected because direct Three.js gives
the app better control over geometry, renderer fallback, and payload splitting.
