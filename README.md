# Claude Code & MCP Workspace Hardening

A practical self-audit checklist for developers using **Claude Code, Codex, Cursor, MCP servers, hooks, skills, scheduled agents, or other AI-assisted coding tools**.

The goal is simple: keep the speed benefits of agentic coding while reducing fragile configuration, accidental over-permission, credential exposure, and recovery surprises.

## Free self-audit

Start with the [AI coding workspace hardening checklist](./CHECKLIST.md). It covers:

- agent and MCP inventory
- permission and remote-write boundaries
- secret and credential handling
- repo instructions, hooks, skills, and scheduled automations
- recovery and rollback
- verification and handoff

## Fixed-scope implementation help — A$149 one-time

If you want the audit and highest-impact fixes applied to one existing workspace, there is a fixed-price service:

**Claude Code & MCP Workflow Audit + Hardening — A$149**

What is included:

- audit one primary repository/workspace
- identify duplicate, stale, or risky agent/tool configuration
- tighten practical permission and credential boundaries
- fix a bounded set of reliability/recovery problems
- verify the important paths that can be tested
- leave a concise handoff with what changed and what remains manual

[Book the fixed-scope audit + hardening](https://buy.stripe.com/9B600d9Mocei2RV8c104801)

This is not a promise of perfect security, autonomous profits, or unlimited support. Larger integrations or rebuilds are scoped separately before additional work begins.

## Safe intake

The checkout asks only for a GitHub username and the repository URL you want reviewed. After payment, invite **@OssaBellator** to the repository (or to a temporary private copy created for the audit).

Do **not** paste passwords, API keys, recovery phrases, card details, private keys, production customer data, or other secrets into GitHub issues or checkout fields.

## Who this is for

This is most useful when your AI coding setup already works but has become difficult to reason about: too many MCP servers, overlapping instructions, stale hooks, broad permissions, flaky automations, or no tested recovery path.

If you are starting from zero, the free checklist is usually the better first step.

## License

The checklist and public documentation in this repository are provided under the MIT License. The paid implementation service is separate from the open-source material.
