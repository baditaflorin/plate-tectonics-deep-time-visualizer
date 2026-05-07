.DEFAULT_GOAL := help

.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push docker-build docker-push compose-up compose-down

help: ## List targets
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "%-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## Wire local git hooks
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev: ## Run the frontend dev server
	npm run dev

build: ## Build the GitHub Pages site into docs/
	npm run build

data: ## Regenerate static data artifacts
	node scripts/write-build-info.mjs
	@echo "Static v1 data is hand-curated in public/data/v1 for this release."

test: ## Run unit tests
	npm run test

test-integration: ## Run integration tests
	@echo "No separate integration suite for Mode A v1."

smoke: ## Build, serve docs/, and run Playwright smoke tests
	npm run smoke

lint: ## Run all linters
	npm run lint

fmt: ## Format source files
	npm run fmt

pages-preview: ## Serve docs/ exactly as Pages will
	npm run pages-preview

release: ## Tag the current commit as v0.1.0
	git tag v0.1.0
	git push origin v0.1.0

docker-build: ## Mode A has no Docker image
	@echo "Skipped: Mode A is GitHub Pages only."

docker-push: ## Mode A has no Docker image
	@echo "Skipped: Mode A is GitHub Pages only."

compose-up: ## Mode A has no Docker Compose stack
	@echo "Skipped: Mode A is GitHub Pages only."

compose-down: ## Mode A has no Docker Compose stack
	@echo "Skipped: Mode A is GitHub Pages only."

hooks-pre-commit: ## Run the pre-commit checks
	.githooks/pre-commit

hooks-commit-msg: ## Run the commit-msg validator with MSG=.git/COMMIT_EDITMSG
	.githooks/commit-msg $${MSG:-.git/COMMIT_EDITMSG}

hooks-pre-push: ## Run the pre-push checks
	.githooks/pre-push

clean: ## Remove local build scratch
	rm -rf node_modules/.tmp coverage playwright-report test-results
