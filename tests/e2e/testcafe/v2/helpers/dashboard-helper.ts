import 'testcafe';
import { getLogger } from 'log4js';
import { IStep, Status } from "../models";
import { BeatsClient, Step, Attachment } from 'bendapi';
import { MiscUtils } from '../utils';
import { getTmtId, parseFormalName } from '../../libs/filter';

const logger = getLogger(__filename);
logger.level = 'info';

const StatusMap = {
  [Status.PASSED]: 5,
  [Status.FAILED]: 8,
}

export class DashboardHelper {

  beatsClient: BeatsClient;

  constructor(private t: TestController) { }

  private async uploadAttachment(file: string, stepId: number, fileContentType: string = "multipart/form-data;") {
    return await this.beatsClient.createAttachment({
      file,
      fileContentType,
      contentType: "step",
      objectId: stepId
    } as Attachment);
  }

  private async createStepInDashboard(step: IStep, testId: number) {
    const beatStep = await this.beatsClient.createStep({
      name: step.message,
      status: StatusMap[step.status],
      startTime: (new Date(step.startTime)).toISOString(),
      endTime: (new Date(step.endTime)).toISOString()
    } as Step, testId);
    if (step.screenshotPath) {
      await this.uploadAttachment(step.screenshotPath, beatStep.id);
    }
    if (step.attachments) {
      for (const attachmentPath of step.attachments) {
        await this.uploadAttachment(attachmentPath, beatStep.id);
      }
    }
  }

  private async createTestInDashboard(runId: number, consoleLogPath) {
    const testRun = this.t['testRun'];
    const errs = testRun.errs;
    const status = (errs && errs.length > 0) ? Status.FAILED : Status.PASSED;
    const tags = parseFormalName(testRun.test.name).tags;
    const tmtId = getTmtId(tags);
    // FIXME: remove user-agent from case name when dashboard is ready
    const beatsTest = await this.beatsClient.createTest({
      name: `${testRun.test.name}    (${testRun.browserConnection.browserInfo.userAgent})`,
      status: StatusMap[status],
      metadata: {
        user_agent: testRun.browserConnection.browserInfo.userAgent,
      },
      tmtId: tmtId[0]
    } as any, runId);
    for (const step of this.t.ctx.logs) {
      await this.createStepInDashboard(step, beatsTest.id);
    }
    // create a step to store test level data
    logger.info(`add detail as an extra step to case ${beatsTest.id}`);
    const detailStep = <IStep>{
      status,
      message: 'Test Detail',
      attachments: [],
    };
    detailStep.startTime = Date.now();
    detailStep.attachments.push(consoleLogPath);
    if (status === Status.FAILED) {
      const errorDetailPath = MiscUtils.createTmpFile(JSON.stringify(errs, null, 2))
      detailStep.attachments.push(errorDetailPath);
      for (const err of errs) {
        if (err.screenshotPath) {
          detailStep.attachments.push(err.screenshotPath);
        }
      }
    }
    detailStep.endTime = Date.now();
    await this.createStepInDashboard(detailStep, beatsTest.id);
  }

  public async teardown(beatsClient: BeatsClient, runId: number, consoleLog: any) {
    this.beatsClient = beatsClient;
    const ts = Date.now();
    try {
      await this.createTestInDashboard(runId, consoleLog);
    } catch (error) {
      logger.error('fail to create test in dashboard', error);
    }
    logger.info(`it takes ${Date.now() - ts} ms to upload result to dashboard`);
  }
}