# 0015 Deployment Topology

## Status

Accepted

## Context

Mode A uses Pages only.

## Decision

Deploy only to GitHub Pages at
`https://baditaflorin.github.io/plate-tectonics-deep-time-visualizer/`.

## Consequences

No Docker, nginx, Prometheus, or backend server topology exists in v1.

## Alternatives Considered

A Docker backend was rejected because all v1 runtime work happens in the browser.
