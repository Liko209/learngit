/*
Read git-diff and istanbul coverage report
*/
/* eslint-disable */
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const parse = require('parse-diff');

const CODE_SCALE = Number(process.env.CODE_SCALE) || 1e4;
const FAULT_TOLERANCE_RATE = Number(process.env.FAULT_TOLERANCE_RATE) || 5e-4;
const COVERAGE_THRESHOLD = Number(process.env.COVERAGE_THRESHOLD) || 0.85;
const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();

function calculateDiffCoverage(diff, coverage, projectRoot) {
  let totalLines = 0;
  let coveredLines = 0;

  for (const section of diff) {
    const file = path.join(projectRoot, section.to);
    // only take files match `collectCoverageFrom` into account
    // ref: https://github.com/facebook/jest/issues/1211
    const fileCoverage = coverage[file];
    if (!fileCoverage) continue;
    // get number of covered lines from statement
    const coveredLineNumbers = new Set();
    const uncoveredLineNumbers = new Set();
    for (const i in fileCoverage.s) {
      const bucket = (fileCoverage.s[i] > 0) ? coveredLineNumbers : uncoveredLineNumbers;
      const range = fileCoverage.statementMap[i];
      // a quick way for range search, using memory to trade off code simplicity
      for (let l = range.start.line; l <= range.end.line; l++) {
        bucket.add(l);
      }
    }
    // sum up total lines and covered lines
    for (const chunk of section.chunks) {
      for (const line of chunk.changes) {
        // only lines in new file are taken into account
        if ('add' !== line.type) continue;
        if (coveredLineNumbers.has(line.ln)) {
          // covered statements
          coveredLines += 1;
          totalLines += 1;
        } else if (uncoveredLineNumbers.has(line.ln)) {
          // uncovered statements
          totalLines += 1;
        } else {
          // not a statements, like comments, type import, interface, etc
        }
      }
    }
  }
  return { coveredLines, totalLines };
}

function passCondition(coveredLines, totalLines, codeScale, faultToleranceRate, threshold) {
  // the original coverage rate would be flaky for small diff
  // for example, if a diff just change one line of code and that code is not covered,
  // since it won't lower the overall coverage rate too much,
  // it should be allow to pass the test.

  // we use estimated overall coverage rate to solve this problem,
  // overall coverage rate can be estimated based on code scale (how many lines in total) and threshold,
  // (here we suppose the overall coverage rate has already exceeded threshold before apply this diff)
  // if the diff won't lower the overall coverage rate too much,
  // it will be considered to pass the test.
  const overallCoverageRate = (codeScale * threshold + coveredLines) / (codeScale + totalLines);
  console.log('OVERALL COVERAGE RATE ESTIMATION:');
  console.log(`(codeScale * threshold + coveredLines) / (codeScale + totalLines) = ${(100 *overallCoverageRate).toFixed(2)}%`)
  return overallCoverageRate >= (threshold - faultToleranceRate);
}

function testCoverage(diff, coverage, projectRoot, codeScale, faultToleranceRate, threshold) {
  const { coveredLines, totalLines } = calculateDiffCoverage(diff, coverage, projectRoot);
  const diffCoverageRate = coveredLines / totalLines;
  console.log('DIFF COVERAGE RATE:');
  console.log(`coveredLines / totalLines = ${coveredLines} / ${totalLines} = ${(100 * diffCoverageRate).toFixed(2)}%`);
  assert.ok(
    passCondition(coveredLines, totalLines, codeScale, faultToleranceRate, threshold),
    `overall coverage rate is drop to ${threshold} (estimated)`,
  );
}

function main() {
  // read coverage data
  const coverageFile = process.env.COVERAGE_FINAL || path.join(process.cwd(), 'coverage/coverage-final.json');
  const coverageData = require(coverageFile);

  // read stdout of `git diff --unified=0 --no-renames -G. --minimal`
  const codeDiff = parse(fs.readFileSync(0, 'utf-8'));  // read from stdin

  // test coverage
  testCoverage(codeDiff, coverageData, PROJECT_ROOT, CODE_SCALE, FAULT_TOLERANCE_RATE, COVERAGE_THRESHOLD);
}

// start!
main();