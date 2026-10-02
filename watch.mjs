#!/usr/bin/env node
import fs from 'node:fs';

export const WATCH_LABEL = 'watch-active';
export const START_RE = /<!--\s*watch-start:([^>]+?)\s*-->/u;
export const REPORT_RE = /<!--\s*watch-report:(baseline|day30|day60)\s*-->/gu;
export const REPO_RE = /https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:[\s/?#]|$)/iu;

export function parseRepoUrl(body='') {
  const m = String(body).match(REPO_RE);
  if (!m) throw new Error('No public GitHub repository URL was found in the watch issue.');
  return { owner:m[1], repo:m[2] };
}

export function findWatchState(comments=[]) {
  let startedAt = null;
  const reports = new Set();
  for (const comment of comments) {
    const body = String(comment && comment.body || '');
    const sm = body.match(START_RE);
    if (sm && !startedAt) {
      const d = new Date(sm[1].trim());
      if (!Number.isNaN(d.getTime())) startedAt = d;
    }
    for (const m of body.matchAll(REPORT_RE)) reports.add(m[1]);
  }
  return { startedAt, reports };
}

export function dueReports(startedAt, now, completed) {
  const elapsedDays = (now.getTime() - startedAt.getTime()) / 86400000;
  const due = [];
  if (!completed.has('baseline')) due.push('baseline');
  if (elapsedDays >= 30 && !completed.has('day30')) due.push('day30');
  if (elapsedDays >= 60 && !completed.has('day60')) due.push('day60');
  return due;
}

function classify(paths) {
  const lower = new Set(paths.map(function(p){return p.toLowerCase();}));
  const starts = function(prefix){return paths.filter(function(p){return p.toLowerCase().startsWith(prefix);});};
  const exact = function(...names){return names.filter(function(n){return lower.has(n.toLowerCase());});};
  const surfaces = {
    agentInstructions:[...exact('AGENTS.md','CLAUDE.md','.github/copilot-instructions.md'),...starts('.github/instructions/'),...starts('.github/agents/'),...starts('.claude/commands/')],
    mcpConfiguration:exact('.mcp.json','mcp.json','.cursor/mcp.json','.vscode/mcp.json','.claude/mcp.json','.windsurf/mcp.json'),
    agentSettings:exact('.claude/settings.json','.claude/settings.local.json','.cursor/settings.json','.vscode/settings.json'),
    automation:[...starts('.github/workflows/'),...starts('.claude/hooks/'),...exact('lefthook.yml','lefthook.yaml','.pre-commit-config.yaml')]
  };
  for (const k of Object.keys(surfaces)) surfaces[k]=[...new Set(surfaces[k])].sort();
  const secretLike = paths.filter(function(p){
    const base=p.split('/').at(-1).toLowerCase();
    if (/^\.env(?:\.|$)/u.test(base) && !/\.(example|sample|template)$/u.test(base)) return true;
    if (['credentials.json','secrets.json','.npmrc','.pypirc','.netrc'].includes(base)) return true;
    return /\.(pem|p12|pfx|key|keystore|jks)$/u.test(base);
  });
  const findings=[];
  if (!surfaces.agentInstructions.length) findings.push('No common agent instruction file was found.');
  if (surfaces.mcpConfiguration.length > 1) findings.push('Multiple MCP configuration files are present ('+surfaces.mcpConfiguration.length+'); confirm which one is canonical.');
  if (surfaces.agentInstructions.length > 2) findings.push('Several agent instruction surfaces are present ('+surfaces.agentInstructions.length+'); check for duplication or conflicting rules.');
  if (surfaces.automation.length > 8) findings.push('Many automation/hook surfaces were found ('+surfaces.automation.length+'); verify ownership, retries, and stop conditions.');
  if (secretLike.length) findings.push(secretLike.length+' secret-like filename(s) were detected. Contents were not read; verify storage and ignore rules manually.');
  return {surfaces,secretLikeCount:secretLike.length,findings};
}

export function renderReport(kind, target, commitSha, paths) {
  const c=classify(paths);
  const label={baseline:'Baseline',day30:'Day 30',day60:'Day 60'}[kind];
  const lines=[
    '<!-- watch-report:'+kind+' -->',
    '## '+label+' public-repository hardening watch report',
    '',
    '**Target:** https://github.com/'+target.owner+'/'+target.repo,
    '**Default-branch commit:** '+commitSha.slice(0,12),
    '**File names enumerated:** '+paths.length,
    ''
  ];
  for (const entry of Object.entries(c.surfaces)) {
    const name=entry[0], values=entry[1];
    lines.push('### '+name.replace(/([A-Z])/g,' $1').replace(/^./,function(x){return x.toUpperCase();}));
    if (!values.length) lines.push('- None found on common paths');
    else for (const v of values.slice(0,40)) lines.push('- '+v.replaceAll(String.fromCharCode(96),'ˋ'));
    if (values.length>40) lines.push('- …and '+(values.length-40)+' more');
    lines.push('');
  }
  lines.push('### Review notes');
  if (!c.findings.length) lines.push('- No filename-level review notes were triggered.');
  else c.findings.forEach(function(x){lines.push('- '+x);});
  lines.push(
    '',
    '### Limits',
    '- Public GitHub metadata and file names only; target file contents were not fetched by this watch.',
    '- Target repository code was not cloned or executed and dependencies were not installed.',
    '- Presence/absence is an inventory signal, not a vulnerability verdict or security certification.',
    '',
    'For a deeper human-reviewed public-repository audit: https://ossabellator.github.io/claude-code-mcp-hardening/repo-audit.html'
  );
  return lines.join('\n')+'\n';
}

async function api(path, token, options={}) {
  const r=await fetch('https://api.github.com'+path,{
    ...options,
    headers:{
      Accept:'application/vnd.github+json',
      'User-Agent':'claude-code-mcp-hardening-watch/1',
      Authorization:'Bearer '+token,
      ...(options.headers||{})
    }
  });
  if (!r.ok) throw new Error('GitHub API '+r.status+' for '+path+': '+(await r.text()).slice(0,500));
  if (r.status===204) return null;
  return r.json();
}

async function postComment(repoFull, issueNumber, body, token) {
  return api('/repos/'+repoFull+'/issues/'+issueNumber+'/comments',token,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({body})
  });
}

async function scanTarget(target, token) {
  const meta=await api('/repos/'+target.owner+'/'+target.repo,token);
  if (meta.private) throw new Error('Watch target is private; this product supports public repositories only.');
  const branch=encodeURIComponent(meta.default_branch || 'main');
  const ref=await api('/repos/'+target.owner+'/'+target.repo+'/git/ref/heads/'+branch,token);
  const commitSha=ref.object.sha;
  const commit=await api('/repos/'+target.owner+'/'+target.repo+'/git/commits/'+commitSha,token);
  const tree=await api('/repos/'+target.owner+'/'+target.repo+'/git/trees/'+commit.tree.sha+'?recursive=1',token);
  if (tree.truncated) throw new Error('GitHub truncated the repository tree; the watch will retry rather than report partial evidence.');
  const paths=(tree.tree||[]).filter(function(x){return x.type==='blob' && typeof x.path==='string';}).map(function(x){return x.path;}).slice(0,8000);
  return {commitSha,paths};
}

async function processIssue(issue, repoFull, token, now=new Date()) {
  if (!issue.labels || !issue.labels.some(function(l){return (typeof l==='string'?l:l.name)===WATCH_LABEL;})) return;
  let target;
  try { target=parseRepoUrl(issue.body||''); }
  catch (e) { await postComment(repoFull,issue.number,'Watch activation error: '+e.message,token); return; }
  let comments=await api('/repos/'+repoFull+'/issues/'+issue.number+'/comments?per_page=100',token);
  let state=findWatchState(comments);
  let startedAt=state.startedAt;
  if (!startedAt) {
    startedAt=now;
    await postComment(repoFull,issue.number,'<!-- watch-start:'+startedAt.toISOString()+' -->\nWatch activated after payment verification. Scheduled checkpoints: baseline, day 30, and day 60.\n',token);
    comments=await api('/repos/'+repoFull+'/issues/'+issue.number+'/comments?per_page=100',token);
    state=findWatchState(comments);
  }
  const due=dueReports(startedAt,now,state.reports);
  for (const kind of due) {
    try {
      const scan=await scanTarget(target,token);
      await postComment(repoFull,issue.number,renderReport(kind,target,scan.commitSha,scan.paths),token);
    } catch (e) {
      await postComment(repoFull,issue.number,'The '+kind+' report is due but could not run yet: '+e.message+'\n\nThe watch will retry on the next scheduled run.',token);
      break;
    }
  }
  if (due.includes('day60')) await postComment(repoFull,issue.number,'The scheduled 60-day watch is complete. This issue can now be closed.',token);
}

async function main() {
  const token=process.env.GITHUB_TOKEN;
  const repoFull=process.env.GITHUB_REPOSITORY;
  if (!token || !repoFull) throw new Error('GITHUB_TOKEN and GITHUB_REPOSITORY are required.');
  const eventName=process.env.GITHUB_EVENT_NAME || '';
  const eventPath=process.env.GITHUB_EVENT_PATH;
  if (eventName==='issues' && eventPath) {
    const event=JSON.parse(fs.readFileSync(eventPath,'utf8'));
    if (event.action==='labeled' && event.label && event.label.name===WATCH_LABEL) await processIssue(event.issue,repoFull,token);
    return;
  }
  const issues=await api('/repos/'+repoFull+'/issues?state=open&labels='+encodeURIComponent(WATCH_LABEL)+'&per_page=100',token);
  for (const issue of issues) if (!issue.pull_request) await processIssue(issue,repoFull,token);
}

if (process.argv[1] && process.argv[1].replaceAll('\\','/').split('/').at(-1)==='watch.mjs') {
  main().catch(function(e){console.error(e);process.exit(1);});
}
