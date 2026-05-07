# 0007 Data Generation Pipeline

## Status

Accepted

## Context

Mode A does not require an offline backend, but the prompt reserves Mode B for
larger generated artifacts.

## Decision

Do not add a Mode B data-generation service in v1. `make data` records build
metadata and documents that the v1 JSON is hand-curated and deterministic.

## Consequences

There is no Go generator to maintain yet. Future larger datasets can add Mode B
with release-hosted artifacts and a new ADR.

## Alternatives Considered

A generator was rejected because it would currently just rewrite static JSON.
