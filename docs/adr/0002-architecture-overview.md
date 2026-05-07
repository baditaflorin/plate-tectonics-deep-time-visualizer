# 0002 Architecture Overview

## Status

Accepted

## Context

The app needs a clear boundary between data loading, reconstruction, rendering,
timeline controls, and narration.

## Decision

Use feature modules under `src/features`. Earth data and reconstruction live in
`features/earth`; narration lives in `features/narration`; shared UI utilities
live in `src/shared`.

## Consequences

The visualization can evolve without tangling data schemas, renderer code, and
LLM UX.

## Alternatives Considered

A flat component tree was simpler at first but would make renderer and data
changes harder to review.
