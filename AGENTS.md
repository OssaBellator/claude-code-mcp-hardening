# Repository agent instructions

This repository contains public documentation, static GitHub Pages assets, and a zero-dependency read-only inventory utility for AI coding workspace hardening.

## Boundaries

- Do not add passwords, API keys, tokens, customer data, private keys, or other secrets.
- Keep `audit.mjs` read-only. It may inspect file and directory names, but it must not execute repository code, install dependencies, mutate the target repository, or make network requests.
- Treat the public checklist and audit utility as configuration-review aids, not vulnerability scanners or security certifications.
- Keep paid-service claims bounded to the documented scope.
- Do not add analytics, trackers, or third-party scripts to the static site without an explicit reason and review.

## Verification

For changes to `audit.mjs`, run:

```sh
node --check audit.mjs
node audit.mjs . --json
```

For static HTML changes, verify local links resolve and do not introduce credential-like literals.
