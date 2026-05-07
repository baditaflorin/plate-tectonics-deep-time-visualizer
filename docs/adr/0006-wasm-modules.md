# 0006 WASM Modules

## Status

Accepted

## Context

The concept calls for a GPlates-inspired C++ paleogeographic reconstruction
subset in the browser.

## Decision

Ship a tiny WASM reconstruction kernel at `/wasm/reconstruction.wasm`. Keep
`wasm/reconstruction.cpp` as the source contract and compile an equivalent WAT
module with `wabt` during local builds.

## Consequences

The app has a real WASM execution path while avoiding an Emscripten dependency in
local hooks. A TypeScript fallback keeps the map usable if WASM loading fails.

## Alternatives Considered

Full GPlates WASM was rejected for v1 scope. A pure TypeScript-only kernel was
rejected because it would not exercise the intended WASM boundary.
