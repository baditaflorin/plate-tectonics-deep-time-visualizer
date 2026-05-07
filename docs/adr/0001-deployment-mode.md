# 0001 Deployment Mode

## Status

Accepted

## Context

The project should default to GitHub Pages unless a runtime backend is genuinely
required.

## Decision

Use Mode A: Pure GitHub Pages. The app ships as static HTML, JS, CSS, JSON, and
WASM. Optional local LLM narration is a browser-origin request to a user-provided
localhost-compatible endpoint.

## Consequences

There is no runtime server, database, auth, or secret management surface. GitHub
Pages header limitations mean the WASM kernel must avoid threads and shared
memory in v1.

## Alternatives Considered

Mode B was unnecessary because the first dataset is small enough to commit.
Mode C was rejected because no v1 feature needs runtime secrets, writes, or auth.
