#!/usr/bin/env node
import process from 'node:process';
import { auditRepository, renderAuditMarkdown } from './audit-lib.mjs';

function usage() {
  console.log('Usage: node audit.mjs [repository-path] [--json]');
  console.log('Read-only: inspects file/directory names only; it does not read file contents or use the network.');
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) { usage(); process.exit(0); }
const jsonMode = args.includes('--json');
const targetArg = args.find((arg) => !arg.startsWith('-')) ?? '.';

try {
  const result = auditRepository(targetArg);
  console.log(jsonMode ? JSON.stringify(result, null, 2) : renderAuditMarkdown(result).trimEnd());
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}
