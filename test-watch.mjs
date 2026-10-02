import assert from 'node:assert/strict';
import {parseRepoUrl,findWatchState,dueReports,renderReport} from './watch.mjs';

assert.deepEqual(parseRepoUrl('Repo: https://github.com/acme/demo'),{owner:'acme',repo:'demo'});
assert.throws(function(){parseRepoUrl('no repo here');});

const state=findWatchState([
  {body:'<!-- watch-start:2026-01-01T00:00:00.000Z -->'},
  {body:'<!-- watch-report:baseline -->\nreport'}
]);
assert.equal(state.startedAt.toISOString(),'2026-01-01T00:00:00.000Z');
assert.deepEqual([...state.reports],['baseline']);
assert.deepEqual(dueReports(state.startedAt,new Date('2026-01-31T00:00:00.000Z'),state.reports),['day30']);
assert.deepEqual(dueReports(state.startedAt,new Date('2026-03-02T00:00:00.000Z'),new Set(['baseline','day30'])),['day60']);

const report=renderReport('baseline',{owner:'acme',repo:'demo'},'1234567890abcdef',[
  'AGENTS.md','.mcp.json','.github/workflows/ci.yml','.env'
]);
assert.match(report,/Baseline public-repository/);
assert.match(report,/secret-like filename/);
assert.match(report,/file contents were not fetched/);
console.log('watch tests passed');
