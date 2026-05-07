# 0008 Go Backend Layout

## Status

Accepted

## Context

The bootstrap requirements define a Go layout for Modes B and C.

## Decision

Skip Go backend directories in Mode A. There are no `cmd/`, `internal/`, `pkg/`,
or Docker runtime components.

## Consequences

The repository stays focused on the static app. If Mode B/C is later adopted,
the layout will follow the requested Go project layout in a new ADR.

## Alternatives Considered

Adding empty Go directories was rejected because it implies a backend that does
not exist.
