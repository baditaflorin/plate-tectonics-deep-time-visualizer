# 0009 Configuration And Secrets

## Status

Accepted

## Context

The frontend must never contain secrets.

## Decision

Use only public build-time values and local user preferences. `.env.example`
documents optional local LLM defaults. Gitleaks runs in pre-commit.

## Consequences

There are no API keys, tokens, or server credentials in the app.

## Alternatives Considered

Encrypted frontend secrets were rejected because frontend secrets are still
public.
