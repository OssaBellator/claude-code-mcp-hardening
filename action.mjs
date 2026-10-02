#!/usr/bin/env node
import { appendFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const actionRoot = path.dirname(fileURLToPath(import.meta.url));
const workspace = process.env.GITHUB_WORKSPACE ? path.resolve(process.env.GITHUB_WORKSPACE) : process.cwd();
const auditScript = path.join(actionRoot, 'audit.mjs');

const result = spawnSync(process.execPath, [auditScript, workspace], {
  cwd: workspace,
  shell: false,
  encoding: 'utf8',
  windowsHide: true,
  maxBuffer: 2 * 1024 * 1024,
  env: process.env,
});

if (result.stderr) process.stderr.write(result.stderr);
if (result.stdout) process.stdout.write(result.stdout);

if (typeof process.env.GITHUB_STEP_SUMMARY === 'string' && process.env.GITHUB_STEP_SUMMARY) {
  const summary = [
    '# AI coding workspace hardening inventory',
    '',
    result.stdout || '_No report output was produced._',
    '',
    '> This action is a configuration inventory aid. It does not execute target repository code, install dependencies, or prove the absence of vulnerabilities.',
    '',
  ].join('\n');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary, 'utf8');
}

process.exit(typeof result.status === 'number' ? result.status : 1);
