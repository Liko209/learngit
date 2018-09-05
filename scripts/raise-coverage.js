/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:44:49
 * Copyright © RingCentral. All rights reserved.
 */
const fs = require('fs');
const { resolve } = require('path');
const chalk = require('chalk');

const log = console.log;
const cwd = process.cwd();
const summaryPath = resolve(cwd, 'coverage/coverage-summary.json');
const thresholdPath = resolve(cwd, 'config/coverage-threshold.json');

raiseCoverage(summaryPath, thresholdPath);

function raiseCoverage(summaryPath, thresholdPath) {
  log(chalk.green('=============================\n'));

  const summary = readJSON(summaryPath);
  const threshold = readJSON(thresholdPath);
  let improved = false;
  Object.entries(threshold.global).forEach(([key, pct]) => {
    const newPct = summary.total[key].pct;
    if (newPct > pct) {
      threshold.global[key] = newPct;
      improved = true;
    }
    logCoverage(key, pct, newPct);
  });

  if (improved) {
    writeJSON(thresholdPath, threshold);
    log(chalk.green.bold('\nGood job!!!'));
  } else {
    log('\nNothing changed.');
  }
  log(chalk.green('\n=============================\n'));
}

function logCoverage(key, oldPct, newPct) {
  const coverageType = key.padStart(10);
  const oldPctStr = colorPct(oldPct);
  const newPctStr = colorPct(newPct);
  if (newPct > oldPct) {
    log(`${coverageType}: ${oldPctStr} => ${newPctStr}`);
  } else {
    log(`${coverageType}: ${oldPctStr}`);
  }
}

function colorPct(pct) {
  const str = String(pct).padEnd(5) + '%';
  if (pct > 80) {
    return chalk.green(str);
  } else if (pct > 60) {
    return chalk.yellow(str);
  } else {
    return chalk.red(str);
  }
}

function readJSON(path) {
  if (fs.existsSync(path)) {
    const str = fs.readFileSync(path).toString();
    return JSON.parse(str);
  } else {
    throw new Error(`File not existed: ${path}`);
  }
}

function writeJSON(path, json) {
  fs.writeFileSync(path, JSON.stringify(json, null, 2));
}
