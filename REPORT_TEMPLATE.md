# Public repository hardening audit — report format

> **Repository:** `owner/repository`  
> **Audit focus:** optional buyer-provided focus  
> **Scope:** public GitHub evidence only; target repository code not executed

## Executive summary

A short summary of the most important review priorities and the evidence boundary.

## Evidence inspected

- Default branch
- Repository tree entries inspected
- Public configuration files read
- Agent instruction surfaces
- MCP configuration surfaces
- GitHub Actions workflows
- Repository code executed: **No**
- Private repository access: **No**

## Findings

### 1. [Priority] Finding title

**Evidence:** `path/to/file`

**Observation:** What the public evidence shows.

**Why it matters:** The operational or security consequence, without overstating exploitability.

**Recommended next action:** The smallest practical verification or remediation step.

## Positive controls

Useful controls visible in the public repository are called out as well; the report is not designed to manufacture a list of negatives.

## Limitations

- Public GitHub evidence only.
- Repository code, dependencies, workflows and build scripts were not executed.
- Private settings, branch protection, organization policy, runtime infrastructure and secret stores may be invisible.
- Pattern findings require human verification and are not vulnerability verdicts.

## Next step

Hands-on implementation is a separate A$149 service. No additional work starts automatically.
