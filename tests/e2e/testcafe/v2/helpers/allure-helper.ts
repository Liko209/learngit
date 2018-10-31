import * as fs from 'fs';
import * as appRoot from 'app-root-path';
import * as Runtime from 'allure-js-commons/runtime';
import * as Allure from 'allure-js-commons';
import { identity } from 'lodash';

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
  private testController;

  constructor(testController) {
    this.testController = testController;
  }

  configure() {
    this.allureReporter = new Allure();
    this.allure = new Runtime(this.allureReporter);
    const targetDir = process.env.ALLURE_DIR ? `${process.env.ALLURE_DIR}/allure/allure-results` : `${appRoot}/allure/allure-results`;
    this.allureReporter.setOptions({ targetDir });
    this[errorDecorator] = this.createErrorDecorator();
  }

  initReporter() {
    this.testController.fixtureCtx.startTime = this.testController.fixtureCtx.startTime || Date.now();
    this.testController.ctx.startTime = Date.now();
  }

  startSuite(fixtureName, startTime) {
    this.allureReporter.startSuite(fixtureName, startTime);
  }

  endSuite(endTime) {
    this.allureReporter.endSuite(endTime);
  }

  startCase(caseName, startTime, userAgent) {
    this.allureReporter.startCase(caseName, startTime);
    this.allure.addArgument('User Agent', userAgent);
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

  writeReport() {
    this.configure();
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
    } = this.testController.testRun;

    const { testStatus, testInfo } = this.buildErrorTestInfo(this.testController.testRun.errs[0]);
    const failScreenShotPath = this.testController.testRun.errs.length > 0 ? this.testController.testRun.errs[0].screenshotPath : null;
    this.startSuite(fixtureName, fixtureStartTime);
    this.startCase(testCaseName, testCaseStartTime, userAgent);
    this.writeSteps(steps);
    if (failScreenShotPath) this.addScreenshot(failScreenShotPath, 'ScreenShot On Fail');
    this.endCase(testStatus, testInfo, Date.now());
    this.endSuite(Date.now());
  }

  writeSteps(steps) {
    for (const step of steps) {
      this.startStep(step.message, step.startTime);
      if (step.children && step.children.length) {
        this.writeSteps(step.children);
      }
      if (step.screenshotPath) {
        this.addScreenshot(step.screenshotPath);
      }
      this.endStep(step.status, step.endTime);
    }
  }

  addScreenshot(screenshotPath, screenshotName = 'screenshot') {
    if (screenshotPath && fs.existsSync(screenshotPath)) {
      const img = fs.readFileSync(screenshotPath);
      this.allureReporter.addAttachment(screenshotName, img);
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
