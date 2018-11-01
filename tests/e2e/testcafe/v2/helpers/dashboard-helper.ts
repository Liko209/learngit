import 'testcafe';
import { getLogger } from 'log4js';
import { IStep, Status } from "../models";
import { BeatsClient, Step, Attachment } from 'bendapi';

const logger = getLogger(__filename);
logger.level = 'info';

const StatusMap = {
  [Status.PASSED]: 5,
  [Status.FAILED]: 8,
}

export class DashboardHelper {

  beatsClient: BeatsClient;

  constructor(private t: TestController) { }

  private async uploadAttachment(file: string, stepId: number) {
    return await this.beatsClient.createAttachment({
      file,
      contentType: "step",
      fileContentType: "multipart/form-data;",
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
      this.uploadAttachment(step.screenshotPath, beatStep.id);
    }
  }

  private async createTestInDashboard(runId: number) {
    const testRun = this.t['testRun'];
    const errs = testRun.errs;
    const status = (errs && errs.length > 0) ? Status.FAILED : Status.PASSED;
    // FIXME: remove user-agent from case name when dashboard is ready
    const beatsTest = await this.beatsClient.createTest({
      name: `${testRun.test.name}    (${testRun.browserConnection.browserInfo.userAgent})`,
      status: StatusMap[status],
      metadata: {
        user_agent: testRun.browserConnection.browserInfo.userAgent,
      }
    } as any, runId);
    for (const step of this.t.ctx.logs) {
      await this.createStepInDashboard(step, beatsTest.id);
    }
    // TODO: dump error message to attachment
    if (status === Status.FAILED) {
      logger.info(`add error message as an extra step to case ${beatsTest.id}`);
      const now = Date.now();
      await this.createStepInDashboard(
        {
          message: 'Error',
          status: Status.FAILED,
          startTime: now,
          endTime: now,
        }, beatsTest.id);
    }
  }

  public async teardown(beatsClient: BeatsClient, runId: number) {
    this.beatsClient = beatsClient;
    const ts = Date.now();
    try {
      await this.createTestInDashboard(runId);
    } catch (error) {
      logger.error('fail to create test in dashboard', error);
    }
    logger.info(`it takes ${Date.now() - ts} ms to upload result to dashboard`);
  }
}