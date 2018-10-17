import 'testcafe';
import { IStep, Status } from "../models";

export class LogHelper {
  constructor(private t: TestController) {
  }

  async setup() {
    this.t.ctx.log = [];
  }

  async takeScreenShot() {

  }

  writeStep(step: IStep) {
    this.t.ctx.log.push(step);
  }

  async logAsync(step: IStep, cb: () => Promise<any>) {
    step.startTime = Date.now();
    try {
      const ret = await cb()
      step.status = Status.PASSED;
      return ret;
    } catch (error) {
      step.status = Status.FAILED;
      throw error;
    } finally {
      step.endTime = Date.now();
      this.writeStep(step);
    }
  }
}
