# Postmortem

## What Was Built

A static GitHub Pages v1 with a Three.js globe, WebGPU/WebGL renderer selection,
WASM reconstruction kernel, static tectonic data, timeline controls, mountain
uplift cues, repository and PayPal links, version/commit metadata, local hooks,
tests, and deployment docs.

## Was Mode A Correct?

Yes. The app has no writes, no auth, no secrets, and no runtime-only data source.
The optional local LLM path can stay client-side and does not justify a backend.

## What Worked

The static-data approach kept deployment simple. The WASM kernel is tiny and fast
enough for the current polygon count. GitHub Pages is a good fit for the public
surface.

## What Did Not

The v1 reconstruction data is educational and approximate, not a full GPlates
scientific dataset. GitHub Pages cannot set custom COOP/COEP headers, so the WASM
kernel avoids threads and shared memory.

## Accepted Tech Debt

The checked-in C++ source documents the intended GPlates-like kernel, while the
current build compiles an equivalent WAT module through npm `wabt` to avoid a
local Emscripten requirement.

## Next Improvements

1. Replace approximate polygons with openly licensed GPlates-compatible static
   reconstruction artifacts.
2. Add a Web Worker around the reconstruction kernel when the dataset grows.
3. Add an animated camera tour with shareable URL states.

## Time

Estimated v1 scaffold: one focused session. Actual implementation stayed within
that scope, with the main compromise being scientific data fidelity.
