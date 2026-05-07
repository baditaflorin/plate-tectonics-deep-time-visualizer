# Static Data Contract

Schema version: `tectonics.v1`

Committed artifacts:

- `public/data/v1/tectonics.json`
- `public/data/v1/tectonics.meta.json`

Published artifacts:

- `https://baditaflorin.github.io/plate-tectonics-deep-time-visualizer/data/v1/tectonics.json`
- `https://baditaflorin.github.io/plate-tectonics-deep-time-visualizer/data/v1/tectonics.meta.json`

The model contains approximate educational plate polygons, per-plate trajectory
keyframes, mountain-belt activation windows, and narrative events. Breaking
schema changes must use a new path such as `/data/v2`.

The v1 artifact is deterministic and hand-curated. `make data` currently records
build metadata and leaves the checked-in data unchanged.
