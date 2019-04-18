import 'testcafe';
import * as fs from 'fs';
import * as path from 'path';
import * as Runtime from 'allure-js-commons/runtime';
import * as Allure from 'allure-js-commons';
import { identity, findKey } from 'lodash';
import { IStep, IConsoleLog } from '../models';
import { BrandTire } from "../../config";

const testStatusEnum = {
  passed: 'passed',
  skipped: 'skip ped',
  failed: 'failed',
  broken: 'failed',
};

const testInfoEnum = {
  beforeHook: '- Error in test.before hook -\n',
  assertionError: 'AssertionError',
  brokenError: 'BrokenTest',
  brokenErrorMessage: 'This test has been broken',
  testSkipMessage: 'This test has been skipped.',
  testPassMessage: 'This test has been passed.',
};

const errorDecorator = Symbol();

export class AllureHelper {

  private allureReporter;
  private allure;

  constructor(private t: TestController) { }

  configure() {
    this.allureReporter = new Allure();
    this.allure = new Runtime(this.allureReporter);
    const targetDir = process.env.ALLURE_DIR || `./allure/allure-results`;
    this.allureReporter.setOptions({ targetDir });
    this[errorDecorator] = this.createErrorDecorator();
  }

  initReporter() {
    this.t.fixtureCtx.startTime = this.t.fixtureCtx.startTime || Date.now();
    this.t.ctx.startTime = Date.now();
  }

  startSuite(fixtureName, startTime) {
    this.allureReporter.startSuite(fixtureName, startTime);
  }

  endSuite(endTime) {
    this.allureReporter.endSuite(endTime);
  }

  startCase(caseName, startTime, userAgent, accountType) {
    this.allureReporter.startCase(caseName, startTime);
    this.allure.addArgument('User Agent', userAgent);
    this.allure.addArgument('Account Type', findKey(BrandTire, (value) => value === accountType) || accountType);
    this.allure.addEnvironment('Site Url', process.env['SITE_URL'] || 'http://localhost:3000');
    this.allure.addEnvironment('Site Env', process.env['SITE_ENV'] || 'XMN-UP');
    this.allure.addEnvironment('Branch', process.env['BRANCH'] || 'develop');
  }

  endCase(status, testInfo, endTime) {
    this.allureReporter.endCase(status, testInfo, endTime);
  }

  startStep(stepName, startTime) {
    this.allureReporter.startStep(stepName, startTime);
  }

  endStep(status, endTime) {
    this.allureReporter.endStep(status, endTime);
  }

  addArgument(argument, value) {
    this.allure.addArgument(argument, value);
  }

  writeReport(consoleLog: IConsoleLog, accountType: string, rcDataPath: string) {
    this.configure();
    const testRun = this.t['testRun'];
    const {
      test: {
        name: testCaseName,
        fixture: {
          name: fixtureName,
        },
      },
      ctx: {
        logs: steps,
        startTime: testCaseStartTime,
      },
      browserConnection: {
        userAgent,
      },
      fixtureCtx: {
        startTime: fixtureStartTime,
      },
    } = testRun;

    const { testStatus, testInfo } = this.buildErrorTestInfo(testRun.errs[0]);
    const failScreenShotPath = testRun.errs.length > 0 ? testRun.errs[0].screenshotPath : null;
    this.startSuite(fixtureName, fixtureStartTime);
    this.startCase(testCaseName, testCaseStartTime, userAgent, accountType);
    this.writeSteps(steps);
    if (failScreenShotPath) this.addAttachment(failScreenShotPath, 'Screenshot on Failure');
    this.addAttachment(consoleLog.consoleLogPath, 'Console Log Full');
    this.addAttachment(consoleLog.warnConsoleLogPath, `Console Log Warning(${consoleLog.warnConsoleLogNumber})`);
    this.addAttachment(consoleLog.errorConsoleLogPath, `Console Log Error(${consoleLog.errorConsoleLogNumber})`);
    this.addAttachment(rcDataPath, 'RC Data')
    this.endCase(testStatus, testInfo, Date.now());
    this.endSuite(Date.now());
  }

  writeSteps(steps: IStep[]) {
    for (const step of steps) {
      this.startStep(step.text, step.startTime);
      if (step.screenshotPath) {
        this.addAttachment(step.screenshotPath, 'screenshot');
      }
      if (step.attachments) {
        for (const attachment of step.attachments) {
          this.addAttachment(attachment);
        }
      }
      this.endStep(step.status, step.endTime);
    }
  }

  addAttachment(attachmentPath: string, attachmentName?: string) {
    if (attachmentName === undefined)
      attachmentName = path.basename(attachmentPath)

    if (attachmentPath && fs.existsSync(attachmentPath)) {
      const img = fs.readFileSync(attachmentPath);
      if (path.extname(attachmentPath) == '.webp') {
        this.allureReporter.addAttachment(attachmentName, img, 'image/png');
      } else {
        this.allureReporter.addAttachment(attachmentName, img);
      }
    }
  }

  buildErrorTestInfo(errs) {
    let testStatus = testStatusEnum.passed;
    let testInfo = {
      name: '',
      message: testInfoEnum.testPassMessage,
      stack: 'no error',
    };

    if (errs) {
      const errorInfo = errs.formatMessage(this[errorDecorator], 2048);
      const { errorName, errorMessage } = this.formatError(errorInfo);
      testInfo = {
        name: errorName,
        message: errorMessage,
        stack: errorInfo,
      };
      testStatus = errorName !== testInfoEnum.assertionError ? testStatusEnum.broken : testStatusEnum.failed;
    }
    return {
      testStatus,
      testInfo,
    };
  }

  formatError(errorText) {
    let errorMessage = testInfoEnum.brokenError;
    let errorName = testInfoEnum.brokenErrorMessage;
    if (errorText.indexOf(testInfoEnum.assertionError) !== -1) {
      errorName = testInfoEnum.assertionError;
      errorMessage = errorText.substring(0, errorText.indexOf('\n\n'));
    } else if (errorText.indexOf(testInfoEnum.beforeHook) !== -1) {
      errorName = testInfoEnum.beforeHook;
      errorMessage = errorText.substring(testInfoEnum.beforeHook.length, errorText.indexOf('\n\n'));
    }
    return { errorName, errorMessage };

  }

  createErrorDecorator() {
    return {
      'span user-agent': str => str,
      'span subtitle': str => `- str -`,
      'div message': str => str,
      'div screenshot-info': identity,
      'a screenshot-path': str => str,
      code: identity,
      'span syntax-string': str => str,
      'span syntax-punctuator': str => str,
      'span syntax-keyword': str => str,
      'span syntax-number': str => str,
      'span syntax-regex': str => str,
      'span syntax-comment': str => str,
      'span syntax-invalid': str => str,
      'div code-frame': identity,
      'div code-line': str => str + '\n',
      'div code-line-last': identity,
      'div code-line-num': str => `${str} |`,
      'div code-line-num-base': str => ` > ${str} ` + '|',
      'div code-line-src': identity,
      'div stack': str => '\n\n' + str,
      'div stack-line': str => str + '\n',
      'div stack-line-last': identity,
      'div stack-line-name': str => `   at ${str}`,
      'div stack-line-location': str => ` (${str})`,
      strong: str => str,
      a: str => `"${str}"`,
    };
  }
}
