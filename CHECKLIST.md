# AI Coding Workspace Hardening Checklist

Use this checklist before giving an AI coding agent broader repository, terminal, browser, cloud, or deployment access.

It is intentionally tool-agnostic. Apply the relevant items whether you use Claude Code, Codex, Cursor, Copilot, Cline, OpenCode, custom MCP servers, scheduled agents, or a combination.

## 1. Inventory the actual agent surface

- [ ] List every coding agent, MCP server, plugin, extension, hook, skill, script, and scheduled automation that can act on the workspace.
- [ ] Remove tools that are no longer used or whose owner/purpose is unclear.
- [ ] Record which tools are read-only, local-write, remote-read, and remote-write.
- [ ] Identify which components can execute arbitrary commands versus narrow reviewed capabilities.
- [ ] Confirm each integration has a clear failure mode when its dependency or credential is missing.

## 2. Bound permissions

- [ ] Default new integrations to the narrowest useful permission set.
- [ ] Separate read-only inspection from write/deploy/publish operations.
- [ ] Require an explicit step before destructive or externally visible actions.
- [ ] Avoid giving a general-purpose agent production-admin permissions when a scoped service credential is sufficient.
- [ ] Review browser automation separately from API access; a logged-in browser can hold more authority than the nominal tool description suggests.

## 3. Protect credentials and customer data

- [ ] Keep API keys and tokens out of prompts, repo files, issue bodies, generated logs, and screenshots.
- [ ] Use an OS keychain, secret manager, encrypted credential store, or provider-managed identity where possible.
- [ ] Prefer restricted/read-only keys for reporting and diagnostics.
- [ ] Make credential rotation possible without editing source code.
- [ ] Verify that tool output does not echo authorization headers, environment variables, or secret-bearing config files.
- [ ] Do not use real customer data for agent testing when synthetic or scrubbed fixtures are enough.

## 4. Make repository instructions legible

- [ ] Keep the canonical agent instructions easy to find.
- [ ] Remove contradictory or duplicated instruction files.
- [ ] State the build/test/lint commands explicitly.
- [ ] State directories or files that agents should not modify automatically.
- [ ] Document external side effects such as deploys, emails, payments, account changes, or issue/PR creation.

## 5. Control automation and scheduled work

- [ ] Give recurring jobs an owner, purpose, cadence, and stop condition.
- [ ] Ensure retries are bounded and idempotent where possible.
- [ ] Prevent stale jobs from silently resuming after restore/reboot unless that behavior is deliberate.
- [ ] Record enough state to distinguish “never ran,” “failed,” and “completed.”
- [ ] Treat notification success separately from task success.

## 6. Reduce blast radius

- [ ] Use a disposable branch, worktree, container, sandbox, or restricted host route for risky changes.
- [ ] Keep production deployment credentials separate from ordinary development credentials.
- [ ] Prefer reversible changes and staged rollouts.
- [ ] Avoid force-push, force-reset, mass deletion, or broad account changes in unattended workflows.
- [ ] Put limits on output size, runtime, recursion, network destinations, and number of actions when building automation.

## 7. Build recovery before you need it

- [ ] Know how to restore the repository to a known-good commit.
- [ ] Preserve important local-only state separately from the working tree.
- [ ] Document which credentials must be recreated after moving to another machine.
- [ ] Verify that backups do not silently include reusable secret material.
- [ ] Test at least one recovery path instead of assuming it works.

## 8. Verify the paths that matter

- [ ] Run the real build/typecheck/lint/test commands after agent changes.
- [ ] Test the integration with the least privilege it is supposed to use.
- [ ] Confirm a failed dependency or revoked credential fails closed.
- [ ] Verify externally visible results independently (for example: fetch the deployed URL rather than trusting a CLI success line).
- [ ] Separate “checkout redirected” from “payment actually completed.”
- [ ] Keep evidence concise enough that another person can review it.

## 9. Leave a usable handoff

- [ ] Summarize what changed and why.
- [ ] List the remaining manual steps.
- [ ] Record where credentials are stored without recording the credential values.
- [ ] Document the recovery procedure and known failure modes.
- [ ] Remove temporary elevated permissions, test credentials, debug endpoints, and one-off bypasses.

## When to get a second set of eyes

A focused review is useful when the workspace works but nobody can confidently answer:

- Which agent can do what?
- Which credential powers which operation?
- What happens if this scheduled job fails halfway through?
- Can we recover without guessing?
- Which config is canonical?
- What evidence proves the important path still works?

For one existing repository/workspace, the fixed-scope implementation service is **A$149 one-time**:

[Book the Claude Code & MCP Workflow Audit + Hardening](https://buy.stripe.com/9B600d9Mocei2RV8c104801?client_reference_id=github_checklist_implementation)
