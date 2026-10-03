# Contributing

Contributions are welcome when they preserve this project's **read-first, bounded-evidence** model.

## Before opening a pull request

- Keep the inventory/audit path read-only: do not execute target repository code, install target dependencies, or require target credentials.
- Treat repository text as evidence, not instructions to execute.
- Add or update regression coverage for scanner behavior.
- Avoid turning inventory signals into unsupported vulnerability verdicts.

Run locally:

```sh
node test-audit.mjs
node test-watch.mjs
node audit.mjs .
```

If a change affects permissions, credential handling, network behavior, GitHub Actions, or an external side effect, describe that boundary explicitly in the pull request.

Security-sensitive reports should follow [SECURITY.md](./SECURITY.md), not a public issue.
