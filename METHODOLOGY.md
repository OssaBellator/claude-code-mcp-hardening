# Public repository audit methodology

The paid public-repository audit is deliberately narrower than a penetration test or source-code security review.

## Evidence inspected

The audit uses public GitHub repository evidence only:

- repository tree paths;
- common AI-agent instruction files such as `AGENTS.md`, `CLAUDE.md`, and GitHub instruction/agent files;
- common MCP configuration files;
- a bounded set of public agent settings;
- GitHub Actions workflow files;
- common quality-gate manifests such as `package.json`;
- public hygiene files such as `.gitignore`, `SECURITY.md`, and `CODEOWNERS`.

The implementation caps the repository tree and the number and size of content files it reads.

## Explicit non-actions

- no target repository clone;
- no target code execution;
- no dependency installation;
- no build, test, hook, workflow, or MCP execution;
- no private repository access;
- no access to private organization settings, production infrastructure, secret stores, billing data, or customer systems.

## Bounded review rules

The audit can flag review items such as:

- missing or competing AI-agent instruction surfaces;
- multiple MCP configuration files;
- unusually large workflow surface;
- absent `.gitignore`;
- publicly tracked secret-like filenames;
- high-confidence credential patterns in the bounded public configuration set;
- GitHub Actions using `permissions: write-all`;
- `pull_request_target` workflows that deserve security-context review;
- third-party GitHub Actions not pinned to full commit SHAs;
- missing common Node quality-gate scripts when `package.json` is present;
- missing public security-policy documentation.

Each finding includes evidence paths when available. Pattern matches require context and are not vulnerability verdicts.

## Priority language

- **High** — public evidence warrants prompt manual verification.
- **Medium** — configuration or operational evidence deserves deliberate review.
- **Info** — hygiene/documentation observation or explicit limitation.

These are review priorities, not exploitability scores.

## Paid intake privacy

The fulfillment path uses only the paid Checkout Session ID internally for de-duplication and returns a one-way SHA-256 fulfillment key to public delivery. Public reports omit the raw session ID and payment/customer details. The audit intake needed for fulfillment is limited to timestamp, amount/currency, GitHub username, public repository URL, and optional audit focus.

## Reproducibility

The free `audit.mjs` utility performs an even narrower local inventory based on file names only. The paid audit reads a bounded set of public GitHub configuration evidence but still never executes the customer's repository code.
