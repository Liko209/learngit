import 'testcafe';
import { IStep, Status } from "../models";

export class LogHelper {
  constructor(private t: TestController) {
  }

  async setup() {
    this.t.ctx.logs = [];
  }

  async takeScreenShot() {

  }

  writeStep(step: IStep) {
    this.t.ctx.logs.push(step);
  }

  async logAsync(step: IStep | string, cb: () => Promise<any>) {
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
      throw error;
    } finally {
      step.endTime = Date.now();
      this.writeStep(step);
    }
  }
}
