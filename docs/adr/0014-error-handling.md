# 0014 Error Handling

## Status

Accepted

## Context

Static apps still need clear failures for data, WASM, and renderer problems.

## Decision

Use an Error Boundary for fatal UI errors, TanStack Query errors for data fetches,
and a TypeScript reconstruction fallback if WASM fails.

## Consequences

Visitors see a clear message instead of a blank page.

## Alternatives Considered

Throwing directly from renderer setup was rejected because WebGPU support varies
across browsers.
