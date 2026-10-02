#!/usr/bin/env node
import { appendFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { auditRepository, renderAuditMarkdown } from './audit-lib.mjs';

try {
  const workspace = process.env.GITHUB_WORKSPACE ? path.resolve(process.env.GITHUB_WORKSPACE) : process.cwd();
  const report = renderAuditMarkdown(auditRepository(workspace));
  process.stdout.write(report);
  if (typeof process.env.GITHUB_STEP_SUMMARY === 'string' && process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      report + '\n> This action is a configuration inventory aid. It does not execute target repository code, install dependencies, or prove the absence of vulnerabilities.\n',
      'utf8'
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}
