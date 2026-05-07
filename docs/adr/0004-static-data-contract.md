# 0004 Static Data Contract

## Status

Accepted

## Context

The globe needs stable, cacheable tectonic data without a backend.

## Decision

Publish `tectonics.v1` as JSON under `/data/v1/`, with a sibling metadata file
containing generation time, source notes, schema version, and checksums.

## Consequences

The frontend can validate data with Zod and cache by version. Breaking changes
must move to `/data/v2`.

## Alternatives Considered

Parquet and SQLite were rejected for v1 because the model is small and JSON keeps
debugging easy.
