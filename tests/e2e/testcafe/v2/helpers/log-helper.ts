import 'testcafe';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import { IStep, Status } from '../models';
import { getLogger } from 'log4js';

const logger = getLogger(__filename);
logger.level = 'info';

export class LogHelper {
  constructor(private t: TestController) {
  }

  async setup() {
    this.t.ctx.logs = [];
  }

  async takeScreenShot() {
    try {
      const imageFileName = `${uuid()}.png`;
      await this.t.takeScreenshot(imageFileName);
      return path.join(this.t['testRun'].opts.screenshotPath, imageFileName);
    } catch (error) {
      console.warn('fail to take screen shot', error);
      return null;
    }
  }

  writeStep(step: IStep) {
    console.log(`${new Date(step.startTime).toLocaleString()} [${step.status}] ${step.message} (${step.endTime - step.startTime}ms)`);
    this.t.ctx.logs.push(step);
  }

  async log(step: IStep | string, takeScreenShot: boolean = false) {
    if (typeof step == 'string') {
      step = <IStep>{ message: step }
    }
    if (step.status === undefined)
      step.status = Status.PASSED;
    if (step.startTime === undefined)
      step.startTime = Date.now();
    if (step.endTime === undefined)
      step.endTime = step.startTime;
    if (takeScreenShot)
      step.screenshotPath = await this.takeScreenShot();
    this.writeStep(step);
  }

  async withLog(step: IStep | string, cb: () => Promise<any>, takeScreenShot: boolean = false) {
    if (typeof step == 'string') {
      step = <IStep>{ message: step }
    }
    step.startTime = Date.now();
    try {
      const ret = await cb()
      step.status = Status.PASSED;
      return ret;
    } catch (error) {
      step.status = Status.FAILED;
      takeScreenShot = true;
      throw error;
    } finally {
      step.endTime = Date.now();
      if (takeScreenShot)
        step.screenshotPath = await this.takeScreenShot();
      this.writeStep(step);
    }
  }
}
