import 'testcafe';
import { getLogger } from 'log4js';
import * as _ from "lodash";
import { IStep } from "../models";
import { BeatsClient, Run, Test, Step, Attachment } from 'bendapi';

const logger = getLogger(__filename);
logger.level = 'info';

export {
  BeatsClient,
  Run,
  Test,
  Step,
  Attachment
}

const PASS = 5;
const FAILED = 8;
const AllureStatusToDashboardStatusMap = {
  'passed': PASS,
  'failed': FAILED
}

export class BendAPIHelper {
  constructor(private t: TestController) { }

  private async saveAttachment(file: string, stepId: number, beatsClient: BeatsClient) {
    return await beatsClient.createAttachment({
      "file": file,
      "contentType": "step",
      "fileContentType": "multipart/form-data;",
      "objectId": stepId
    } as Attachment);
  }

  private async saveStep(step: IStep, testId: number, beatsClient: BeatsClient) {
    let bStep = await beatsClient.createStep({
      "name": step.message,
      "status": AllureStatusToDashboardStatusMap[step.status],
      "startTime": (new Date(step.startTime)).toISOString(),
      "endTime": (new Date(step.endTime)).toISOString()
    } as Step, this.t.ctx.testId);

    if (step.screenshotPath) {
      this.saveAttachment(step.screenshotPath, bStep.id, beatsClient);
    }
  }

  private async saveLogs(beatsClient: BeatsClient) {
    let status = !_.some(this.t['testRun'].errs);
    let test = await beatsClient.createTest({ "name": this.t['testRun'].test.name, "status": status ? PASS : FAILED } as Test);
    this.t.ctx.testId = test.id;
    for (const step of this.t.ctx.logs) {
      await this.saveStep(step, this.t.ctx.testId, beatsClient);

    }
  }

  public async teardown(beatsClient: BeatsClient) {
    logger.info("start writing logs into dashboard");
    await this.saveLogs(beatsClient);
    logger.info("writing logs into dashboard finished");
  }
}