# Deploy

GitHub Pages serves the `docs/` directory from the `main` branch:

https://baditaflorin.github.io/plate-tectonics-deep-time-visualizer/

Manual publish:

```bash
npm install
make build
git add docs src/generated public/wasm
git commit -m "chore: publish pages build"
git push origin main
```

Rollback is a normal git revert of the publishing commit, followed by `git push`.

No custom domain is configured in v1. If a custom domain is added, put the domain
in `docs/CNAME`, configure DNS with the provider, and keep the Vite `base`
strategy aligned with the new Pages URL.
