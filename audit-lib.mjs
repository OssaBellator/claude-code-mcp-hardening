import fs from 'node:fs';
import path from 'node:path';

const MAX_FILES = 8000;
const MAX_DEPTH = 7;
const SKIP_DIRS = new Set([
  '.git','node_modules','.next','dist','build','coverage','.cache','.turbo',
  '.venv','venv','__pycache__','.pytest_cache','.mypy_cache','.idea'
]);

export function auditRepository(rootValue) {
  const root = path.resolve(rootValue);
  let stat;
  try { stat = fs.statSync(root); } catch { throw new Error('Repository path is unavailable.'); }
  if (!stat.isDirectory()) throw new Error('Repository path must be a directory.');

  const files = [];
  let truncated = false;
  function walk(dir, depth) {
    if (truncated || depth > MAX_DEPTH) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    entries.sort((a,b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (files.length >= MAX_FILES) { truncated = true; return; }
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const absolute = path.join(dir, entry.name);
      const relative = path.relative(root, absolute).split(path.sep).join('/');
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(absolute, depth + 1);
      } else if (entry.isFile()) {
        files.push(relative);
      }
    }
  }
  walk(root, 0);

  const set = new Set(files.map((f) => f.toLowerCase()));
  const starts = (prefix) => files.filter((f) => f.toLowerCase().startsWith(prefix.toLowerCase()));
  const exact = (...names) => names.filter((n) => set.has(n.toLowerCase()));

  const surfaces = {
    agentInstructions: [
      ...exact('AGENTS.md','CLAUDE.md','.github/copilot-instructions.md'),
      ...starts('.github/instructions/'),
      ...starts('.github/agents/'),
      ...starts('.claude/commands/'),
    ],
    mcpConfiguration: exact(
      '.mcp.json','mcp.json','.cursor/mcp.json','.vscode/mcp.json',
      '.claude/mcp.json','.windsurf/mcp.json'
    ),
    agentSettings: exact(
      '.claude/settings.json','.claude/settings.local.json',
      '.cursor/settings.json','.vscode/settings.json'
    ),
    automation: [
      ...starts('.github/workflows/'),
      ...starts('.claude/hooks/'),
      ...exact('lefthook.yml','lefthook.yaml','.pre-commit-config.yaml'),
    ],
  };
  for (const key of Object.keys(surfaces)) surfaces[key] = [...new Set(surfaces[key])].sort();

  const secretLike = files.filter((f) => {
    const base = path.posix.basename(f).toLowerCase();
    if (/^\.env(?:\.|$)/u.test(base) && !/\.(example|sample|template)$/u.test(base)) return true;
    if (['credentials.json','secrets.json','.npmrc','.pypirc','.netrc'].includes(base)) return true;
    return /\.(pem|p12|pfx|key|keystore|jks)$/u.test(base);
  });

  const gitignorePresent = set.has('.gitignore');
  const findings = [];
  if (surfaces.agentInstructions.length === 0) findings.push({
    level:'review', id:'instructions-missing',
    message:'No common agent instruction file was found (AGENTS.md, CLAUDE.md, or GitHub Copilot instructions).'
  });
  if (surfaces.mcpConfiguration.length > 1) findings.push({
    level:'review', id:'multiple-mcp-configs',
    message:'Multiple MCP configuration files are present (' + surfaces.mcpConfiguration.length + '); confirm which one is canonical.'
  });
  if (surfaces.agentInstructions.length > 2) findings.push({
    level:'review', id:'instruction-sprawl',
    message:'Several agent instruction surfaces are present (' + surfaces.agentInstructions.length + '); check for duplication or conflicting rules.'
  });
  if (surfaces.automation.length > 8) findings.push({
    level:'review', id:'automation-sprawl',
    message:'Many automation/hook surfaces were found (' + surfaces.automation.length + '); verify ownership, retries and stop conditions.'
  });
  if (secretLike.length > 0 && !gitignorePresent) findings.push({
    level:'review', id:'secret-like-files-without-gitignore',
    message:'Secret-like filenames are present but no .gitignore was found. Verify sensitive files cannot be committed.'
  });
  if (secretLike.length > 0) findings.push({
    level:'info', id:'secret-like-files-present',
    message:secretLike.length + ' secret-like filename(s) were detected. Contents were not read; verify storage and ignore rules manually.'
  });
  if (truncated) findings.push({
    level:'info', id:'scan-truncated',
    message:'Scan stopped after ' + MAX_FILES + ' files or depth ' + MAX_DEPTH + '; results are partial.'
  });

  return {
    schemaVersion:1,
    root:path.basename(root),
    readOnly:true,
    contentRead:false,
    networkUsed:false,
    filesEnumerated:files.length,
    truncated,
    surfaces,
    secretLikeFileCount:secretLike.length,
    gitignorePresent,
    findings,
    note:'Presence/absence is not a vulnerability verdict. Review permissions, credentials, recovery and runtime behavior separately.'
  };
}

export function renderAuditMarkdown(result) {
  const lines = [
    '# AI coding workspace audit',
    '',
    'Scanned **' + result.filesEnumerated + '** file names in **' + result.root + '**. File contents were not read and no network requests were made.',
    '',
  ];
  for (const [label, values] of Object.entries(result.surfaces)) {
    const title = label.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
    lines.push('## ' + title);
    if (values.length === 0) lines.push('- None found on common paths');
    else for (const value of values.slice(0, 40)) lines.push('- ' + value);
    if (values.length > 40) lines.push('- …and ' + (values.length - 40) + ' more');
    lines.push('');
  }
  lines.push('## Review notes');
  if (result.findings.length === 0) lines.push('- No filename-level review notes were triggered.');
  else for (const finding of result.findings) lines.push('- **' + finding.level.toUpperCase() + '** — ' + finding.message);
  lines.push('', 'This is a configuration inventory aid, not a security scanner or certification.');
  return lines.join('\n') + '\n';
}
