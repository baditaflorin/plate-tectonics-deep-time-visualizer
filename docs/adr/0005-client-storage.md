# 0005 Client-Side Storage

## Status

Accepted

## Context

The app only needs to remember local UI preferences.

## Decision

Use `localStorage` for narration mode, local LLM endpoint, and local model name.

## Consequences

Preferences survive reloads without cross-device sync or backend state.

## Alternatives Considered

IndexedDB and OPFS were rejected as unnecessary for small preference values.
