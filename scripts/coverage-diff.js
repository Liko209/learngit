const fs = require('fs');
const assert = require('assert');

function formatDelta(delta) {
  const v = 0 == delta ? '0' : delta.toFixed(2);
  const s = delta > 0 ? '+' : '';
  return `${s}${v}`;
}

function jsonLoad(filePath) {
  const content = fs.readFileSync(filePath).toString();
  return JSON.parse(content);
}

function formatReport(result) {
  return result.map(r => `${r.criterion}:${r.targetPct}(${formatDelta(r.delta)})%`).join(' ');
}

function ensureRaise(result) {
  return result.every(r => r.delta > -0.05)
}

function diff(baseline, target) {
  const result = [];
  for (const criterion in baseline.total) {
    const baselinePct = baseline.total[criterion].pct;
    const targetPct = target.total[criterion].pct;
    const delta = targetPct - baselinePct;
    result.push({ delta, criterion, baselinePct, targetPct, });
  }
  return result;
}

// script start from here
const args = [baselineFile, targetFile] = process.argv.slice(2);
if (2 !== args.length) {
  console.error('invalid arguments\n  usage: node coverage-diff.js baseline.json target.json');
  process.exit(1);
}

const baseline = jsonLoad(baselineFile);
const target = jsonLoad(targetFile);
const result = diff(baseline, target);

// print report to stdout
console.log(formatReport(result));

if (!ensureRaise(result)) {
  console.error('coverage is dropped!')
  process.exitCode = 1;
}
process.exit();