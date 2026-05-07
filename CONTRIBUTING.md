# Contributing

Thanks for helping improve Earth's biography.

## Local Setup

```bash
npm install
make install-hooks
make dev
```

## Checks

```bash
make fmt
make lint
make test
make smoke
```

Commits must use Conventional Commits, for example `feat: add a new tectonic
event`. Do not commit secrets, `.env` files, private keys, or licensed assets
without a clear license note.
