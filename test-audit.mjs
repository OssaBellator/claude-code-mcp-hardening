import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'ai-workspace-audit-'));
try {
  fs.mkdirSync(path.join(temp,'.claude'),{recursive:true});
  fs.mkdirSync(path.join(temp,'.github','workflows'),{recursive:true});
  fs.writeFileSync(path.join(temp,'CLAUDE.md'),'secret contents must never be read');
  fs.writeFileSync(path.join(temp,'.mcp.json'),'{"secret":"do-not-read"}');
  fs.writeFileSync(path.join(temp,'.claude','settings.json'),'{"token":"do-not-read"}');
  fs.writeFileSync(path.join(temp,'.github','workflows','ci.yml'),'name: ci');
  fs.writeFileSync(path.join(temp,'.env'),'REAL_SECRET=never-read');
  fs.writeFileSync(path.join(temp,'.gitignore'),'.env\n');
  const scriptPath=fileURLToPath(new URL('./audit.mjs',import.meta.url));
  const result=spawnSync(process.execPath,[scriptPath,temp,'--json'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const parsed=JSON.parse(result.stdout);
  assert.equal(parsed.readOnly,true);
  assert.equal(parsed.contentRead,false);
  assert.equal(parsed.networkUsed,false);
  assert.deepEqual(parsed.surfaces.agentInstructions,['CLAUDE.md']);
  assert.deepEqual(parsed.surfaces.mcpConfiguration,['.mcp.json']);
  assert.ok(parsed.surfaces.agentSettings.includes('.claude/settings.json'));
  assert.ok(parsed.surfaces.automation.includes('.github/workflows/ci.yml'));
  assert.equal(parsed.secretLikeFileCount,1);
  assert.equal(parsed.gitignorePresent,true);
  assert.ok(!result.stdout.includes('REAL_SECRET'));
  assert.ok(!result.stdout.includes('do-not-read'));
  console.log('audit tests passed');
} finally {
  fs.rmSync(temp,{recursive:true,force:true});
}
