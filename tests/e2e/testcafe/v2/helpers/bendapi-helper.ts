import 'testcafe';
import { getLogger } from 'log4js';
import * as _ from "lodash";
import { Allure2Dashboard, PASS, FAILED } from "../../config"
import { IStep } from "../models";
import { BeatsClient, Test, Step, Attachment } from 'bendapi';

const logger = getLogger(__filename);
logger.level = 'info';

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

  private async saveStep2Dashboard(step: IStep, testId: number, beatsClient: BeatsClient) {
    let bStep = await beatsClient.createStep({
      "name": step.message,
      "status": Allure2Dashboard[step.status],
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
      await this.saveStep2Dashboard(step, this.t.ctx.testId, beatsClient);

    }
  }

  public async teardown(beatsClient: BeatsClient) {
    logger.info("start writing logs into dashboard");
    await this.saveLogs(beatsClient);
    logger.info("writing logs into dashboard finished");
  }
}