import 'testcafe';
import * as _ from 'lodash';
import * as fs from 'fs';
import { parse as parseUserAgent } from 'useragent';
import { identity } from 'lodash';
import * as format from 'string-format';
import { getLogger } from 'log4js';
import { IStep, Status, IConsoleLog, Process } from '../models';
import { MiscUtils } from '../utils';
import { getTmtIds, parseFormalName, formalNameWithTestMetaPrefix } from '../../libs/filter';

import { BrandTire } from '../../config';
import { H, h } from '.';
import { BeatsClient, Test, Step } from 'bendapi-ts';

const logger = getLogger(__filename);
logger.level = 'info';

const StatusMap = {
  [Status.PASSED]: 5,
  [Status.FAILED]: 8,
};

const ProcessMap = {
  [Process.RUN]: 0,
  [Process.FINISH]: 1,
};

export class DashboardHelper {

  beatsClient: BeatsClient;

  constructor(private t: TestController) { }

  private uploadAttachment(file: string, stepId: number, ) {
    return this.beatsClient.createAttachment('step', stepId, fs.createReadStream(file));
  }

  private async createStepInDashboard(step: IStep, testId: number) {
    const beatStep = new Step();
    beatStep.test = testId;
    beatStep.name = step.text.replace(/\{/g, '[').replace(/\}/g, ']');
    beatStep.description = step.description;
    beatStep.metadata = Object.assign({}, step.metadata);
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

    await this.createChildStepInDashboard(step, testId, res.body.id);
  }

  private async createChildStepInDashboard(parentStep: IStep, testId: number, parentStepId: number) {
    const children = parentStep.children;
    if (!children || children.length === 0) {
      return;
    }

    const lastChild = parentStep.children[parentStep.children.length - 1]
    if (!lastChild.endTime) {
      lastChild.endTime = parentStep.endTime;
    }
    for (let child of children) {
      const s = new Step();
      s.test = testId;
      s.name = child.text.replace(/\{/g, '[').replace(/\}/g, ']');
      if (child.metadata && Object.keys(child.metadata).length > 0) {
        s.description = format(child.text.replace(/\$\{/g, '{'), child.metadata);
      }

      s.metadata = Object.assign({}, child.metadata);
      s.status = StatusMap[child.status];
      s.startTime = new Date(child.startTime);
      s.endTime = new Date(child.endTime);
      s.parent = parentStepId;
      const bs = await this.beatsClient.createStep(s);
      if (child.screenshotPath) {
        await this.uploadAttachment(child.screenshotPath, bs.body.id);
      }
      if (child.attachments) {
        for (const attachmentPath of child.attachments) {
          await this.uploadAttachment(attachmentPath, bs.body.id);
        }
      }

      await this.createChildStepInDashboard(child, testId, bs.body.id);
    }
  }

  private async createTestInDashboard(runId: number, consoleLog: IConsoleLog, accountType: string, rcDataPath: string) {
    const testRun = this.t['testRun'];
    const errs = testRun.errs;
    const status = (errs && errs.length > 0) ? Status.FAILED : Status.PASSED;
    const tags = _.union(parseFormalName(testRun.test.name).tags, testRun.test.meta.caseIds);
    const userAgent = parseUserAgent(await H.getUserAgent());

    const beatsTest = new Test();
    beatsTest.run = runId;
    const caseName = formalNameWithTestMetaPrefix(testRun.test.name, testRun.test.meta);
    beatsTest.name = `${caseName}    (${(_.findKey(BrandTire, (value) => value === accountType)) || accountType})`;
    beatsTest.status = StatusMap[status];
    beatsTest.manualIds = getTmtIds(tags, 'JPT');
    beatsTest.startTime = testRun.startTime;
    beatsTest.endTime = new Date();
    beatsTest.process = ProcessMap[Process.FINISH];

    beatsTest.metadata = {
      browser: userAgent.family,
      browserVer: userAgent.toVersion(),
      os: userAgent.os.family,
      osVer: userAgent.os.toVersion(),
      user_agent: testRun.browserConnection.browserInfo.userAgent,
      mockRequestId: h(this.t).mockRequestId,
    };
    const res = await this.beatsClient.createTest(beatsTest);

    for (const step of this.t.ctx.logs) {
      await this.createStepInDashboard(step, res.body.id);
    }
    // create a step to store test level data
    logger.info(`add detail as an extra step to case ${res.body.id}`);
    const detailStep = <IStep>{
      status,
      text: `Test Detail: warning(${consoleLog.warnConsoleLogNumber}), error(${consoleLog.errorConsoleLogNumber})`,
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
