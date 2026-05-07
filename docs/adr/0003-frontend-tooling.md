# 0003 Frontend Tooling

## Status

Accepted

## Context

The frontend needs strict TypeScript, a fast dev server, GitHub Pages builds, and
good Three.js support.

## Decision

Use Vite, React, TypeScript strict mode, Three.js, TanStack Query, Zod, Lucide,
Vitest, and Playwright.

## Consequences

The initial shell stays small while the Three.js renderer is lazy-loaded.

## Alternatives Considered

Next.js and Remix were rejected because their routing/server conventions add
complexity for a static-only app.
