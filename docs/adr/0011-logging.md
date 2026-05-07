# 0011 Logging

## Status

Accepted

## Context

Mode A has no server logs.

## Decision

Use minimal browser logging. Production should have no console errors in the
smoke path. Non-fatal WASM fallback can emit an informational message.

## Consequences

Debugging stays browser-local. There is no log collection.

## Alternatives Considered

Client log beacons were rejected because v1 has no analytics or backend.
