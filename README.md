# Claude Code & MCP Workspace Hardening

[![Self-audit](https://github.com/OssaBellator/claude-code-mcp-hardening/actions/workflows/self-audit.yml/badge.svg)](https://github.com/OssaBellator/claude-code-mcp-hardening/actions/workflows/self-audit.yml)

A practical self-audit checklist for developers using **Claude Code, Codex, Cursor, MCP servers, hooks, skills, scheduled agents, or other AI-assisted coding tools**.

The goal is simple: keep the speed benefits of agentic coding while reducing fragile configuration, accidental over-permission, credential exposure, and recovery surprises.

## At a glance

- **Problem:** AI-assisted repositories accumulate MCP configs, agent instructions, hooks, CI authority and credential surfaces faster than teams can reason about them.
- **Implemented:** zero-dependency read-only inventory, browser audit, GitHub Action, Agent Skill, evidence-based checklist and human-review workflow.
- **Verification:** the repository self-audits in GitHub Actions; the scanner does not execute target code, install target dependencies or require target credentials.
- **Boundary:** findings are review signals, not penetration-test results or vulnerability certification.
- **Try it:** [run the free browser audit](https://ossabellator.github.io/claude-code-mcp-hardening/free-audit.html) or use the local scanner below.

**No-install option:** [Run the free browser audit](https://ossabellator.github.io/claude-code-mcp-hardening/free-audit.html) against any public GitHub repository. It uses bounded public GitHub evidence and does not execute target repository code.

## Repository hardening guide

[Read the evidence-based AI coding agent repository hardening guide](https://ossabellator.github.io/claude-code-mcp-hardening/hardening-guide.html), covering permissions, MCP scopes, hooks, GitHub Actions, credentials, verification, and recovery.

## Free self-audit

Start with the [AI coding workspace hardening checklist](./CHECKLIST.md). It covers:

- agent and MCP inventory
- permission and remote-write boundaries
- secret and credential handling
- repo instructions, hooks, skills, and scheduled automations
- recovery and rollback
- verification and handoff

## Run the free read-only inventory

The repository also includes a zero-dependency Node.js inventory tool. It enumerates file and directory names only; it does **not** read file contents, execute project commands, or use the network.

```bash
git clone https://github.com/OssaBellator/claude-code-mcp-hardening.git
node claude-code-mcp-hardening/audit.mjs /path/to/your/repo
```

For machine-readable output:

```bash
node claude-code-mcp-hardening/audit.mjs /path/to/your/repo --json
```

It flags review prompts such as multiple MCP config surfaces, instruction sprawl, automation sprawl, and secret-like filenames. These are inventory signals, not vulnerability verdicts.

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

[Book the fixed-scope audit + hardening](https://buy.stripe.com/9B600d9Mocei2RV8c104801?client_reference_id=github_readme_implementation)

This is not a promise of perfect security, autonomous profits, or unlimited support. Larger integrations or rebuilds are scoped separately before additional work begins.

## Safe intake

The checkout asks only for a GitHub username and the repository URL you want reviewed. After payment, invite **@OssaBellator** to the repository (or to a temporary private copy created for the audit).

Do **not** paste passwords, API keys, recovery phrases, card details, private keys, production customer data, or other secrets into GitHub issues or checkout fields.

## Who this is for

This is most useful when your AI coding setup already works but has become difficult to reason about: too many MCP servers, overlapping instructions, stale hooks, broad permissions, flaky automations, or no tested recovery path.

If you are starting from zero, the free checklist is usually the better first step.

## License

The checklist and public documentation in this repository are provided under the MIT License. The paid implementation service is separate from the open-source material.


## A$39 public repository audit

For a lower-friction read-only review, the **Public GitHub AI Agent & MCP Hardening Audit** covers one public repository for **A$39 AUD**. It requires no private-repository access and does not execute repository code.

- [View the A$39 audit](https://ossabellator.github.io/claude-code-mcp-hardening/repo-audit.html)
- [See a sample delivered audit](https://github.com/OssaBellator/claude-code-mcp-hardening/issues/1)


## A$79 60-day public repository watch

For repositories that are changing quickly, the **AI Agent Public Repository 60-Day Hardening Watch** delivers three read-only reports for one public GitHub repository: baseline, day 30, and day 60. It is **A$79 AUD one-time**, not a recurring subscription.

The watch does not clone or execute the target repository, install dependencies, or require private access. Follow-up reports are appended to the baseline delivery thread.

- [View the A$79 60-day watch](https://ossabellator.github.io/claude-code-mcp-hardening/watch.html)
- [See the sample report format](https://github.com/OssaBellator/claude-code-mcp-hardening/issues/1)


## Agent Skill

Install the read-first repository hardening skill into supported coding agents:

```bash
npx skills add OssaBellator/claude-code-mcp-hardening --skill auditing-ai-agent-repositories
```

The skill bundles the zero-dependency read-only inventory scanner and treats repository text as untrusted evidence rather than commands to execute.

## GitHub Action

Run the same zero-dependency filename-level inventory in GitHub Actions:

```yaml
name: AI agent repository audit

on:
  workflow_dispatch:
  pull_request:

permissions:
  contents: read

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
        with:
          persist-credentials: false
      - uses: OssaBellator/claude-code-mcp-hardening@v1
```

The Action writes the audit to the GitHub job summary. It does not execute target repository code, install dependencies, or use network access from the audit logic. The Action is an inventory aid, not a vulnerability scanner or security certification.


## Technical case study

[Building a bounded AI-agent commerce and fulfillment workflow](https://ossabellator.github.io/claude-code-mcp-hardening/case-study-agent-ops.html) documents the provider design, GitHub automation, Stripe intake, automated fulfillment, IndexNow indexing, privacy boundaries, and verification approach behind this project.
