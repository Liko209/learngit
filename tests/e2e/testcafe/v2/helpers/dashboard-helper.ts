import 'testcafe';
import * as _ from 'lodash';
import * as fs from 'fs';
import { parse as parseUserAgent } from 'useragent';
import { identity } from 'lodash';

import { getLogger } from 'log4js';
import { IStep, Status, IConsoleLog } from "../models";
import { MiscUtils } from '../utils';
import { getTmtIds, parseFormalName } from '../../libs/filter';
import { BrandTire } from '../../config';
import { H, h } from '.';
import { BeatsClient, Test, Step } from 'bendapi-ts';

const logger = getLogger(__filename);
logger.level = 'info';

const StatusMap = {
  [Status.PASSED]: 5,
  [Status.FAILED]: 8,
}

export class DashboardHelper {

  beatsClient: BeatsClient;

  constructor(private t: TestController) { }

  private uploadAttachment(file: string, stepId: number, ) {
    return this.beatsClient.createAttachment('step', stepId, fs.createReadStream(file));
  }

  private async createStepInDashboard(step: IStep, testId: number) {
    const beatStep = new Step();
    beatStep.test = testId;
    beatStep.name = step.message;
    beatStep.status = StatusMap[step.status];
    beatStep.startTime = new Date(step.startTime);
    beatStep.endTime = new Date(step.endTime);
    const res = await this.beatsClient.createStep(beatStep);

    if (step.screenshotPath) {
      await this.uploadAttachment(step.screenshotPath, res.body.id);
    }
    if (step.attachments) {
      for (const attachmentPath of step.attachments) {
        await this.uploadAttachment(attachmentPath, res.body.id);
      }
    }
  }

  private async createTestInDashboard(runId: number, consoleLog: IConsoleLog, accountType: string, rcDataPath: string) {
    const testRun = this.t['testRun'];
    const errs = testRun.errs;
    const status = (errs && errs.length > 0) ? Status.FAILED : Status.PASSED;
    const tags = parseFormalName(testRun.test.name).tags;
    const userAgent = parseUserAgent(await H.getUserAgent());

    const beatsTest = new Test();
    beatsTest.run = runId;
    beatsTest.name = `${testRun.test.name}    (${(_.findKey(BrandTire, (value) => value === accountType)) || accountType})`;
    beatsTest.status = StatusMap[status];
    beatsTest.manualIds = getTmtIds(tags, 'JPT');
    beatsTest.startTime = testRun.startTime;
    beatsTest.endTime = new Date();

    beatsTest.metadata = {
      browser: userAgent.family,
      browserVer: userAgent.toVersion(),
      os: userAgent.os.family,
      osVer: userAgent.os.toVersion(),
      user_agent: testRun.browserConnection.browserInfo.userAgent,
      mockRequestId: h(this.t).mockRequestId,
    }
    const res = await this.beatsClient.createTest(beatsTest);

    for (const step of this.t.ctx.logs) {
      await this.createStepInDashboard(step, res.body.id);
    }
    // create a step to store test level data
    logger.info(`add detail as an extra step to case ${res.body.id}`);
    const detailStep = <IStep>{
      status,
      message: `Test Detail: warning(${consoleLog.warnConsoleLogNumber}), error(${consoleLog.errorConsoleLogNumber})`,
      attachments: [],
    };
    detailStep.startTime = Date.now();
    detailStep.attachments.push(consoleLog.consoleLogPath);
    detailStep.attachments.push(consoleLog.warnConsoleLogPath);
    detailStep.attachments.push(consoleLog.errorConsoleLogPath);
    detailStep.attachments.push(rcDataPath);
    if (status === Status.FAILED) {
      const errList = [];
      for (const err of errs) {
        if (err.screenshotPath) {
          detailStep.attachments.push(err.screenshotPath);
          const errorText = err.formatMessage(newErrorDecorator(), 2048);
          errList.push(errorText);
        }
      }
      const errorDetailPath = MiscUtils.createTmpFile(errList.join('\n'));
      detailStep.attachments.push(errorDetailPath);
    }
    detailStep.endTime = Date.now();
    await this.createStepInDashboard(detailStep, res.body.id);
  }

  public async teardown(beatsClient: BeatsClient, runId: number, consoleLog: IConsoleLog, accountType: string, rcDataPath: string) {
    this.beatsClient = beatsClient;
    const ts = Date.now();
    try {
      await this.createTestInDashboard(runId, consoleLog, accountType, rcDataPath);
    } catch (error) {
      logger.error('fail to create test in dashboard', error);
    }
    logger.info(`it takes ${Date.now() - ts} ms to upload result to dashboard`);
  }
}

function newErrorDecorator() {
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