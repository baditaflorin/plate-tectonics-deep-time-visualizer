# 0010 GitHub Pages Publishing

## Status

Accepted

## Context

The live URL must work from the beginning and Pages must serve built frontend
assets.

## Decision

Publish from `main` branch `/docs`. Vite builds into `docs/` with base path
`/plate-tectonics-deep-time-visualizer/` and hashed assets. `404.html` is copied
from `index.html`.

## Consequences

`docs/` is intentionally committed and not gitignored. Vite uses
`emptyOutDir: false` so ADRs and docs are not deleted during build.

## Alternatives Considered

`gh-pages` branch was rejected to keep source and published output visible in one
branch. Root publishing was rejected because it would mix app build output with
source files.
