import 'testcafe';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import { IStep, Status, IStepOptions } from '../models';
import { getLogger } from 'log4js';
import { H } from './utils';
import { MiscUtils } from '../utils';

const logger = getLogger(__filename);
logger.level = 'info';

class Step implements IStep {
  t: TestController;

  text: string;
  metadata: { [key: string]: string } = {};
  status?: Status;
  startTime?: number;
  endTime?: number;
  screenshotPath?: string;
  attachments?: string[];
  children?: IStep[];
  error?: any;

  options: IStepOptions;
  closure?: (step?: Step) => Promise<any>;

  constructor(t: TestController, stepOrText: IStep | string, cb: (step?: Step) => Promise<any>, options?: IStepOptions | boolean) {
    if (typeof stepOrText === 'string') {
      this.text = stepOrText;
    } else {
      Object.assign(this, stepOrText);
    }
    if (typeof options === 'boolean') {
      this.options = <IStepOptions>{ takeScreenshot: options };
    } else if (options === undefined) {
      this.options = <IStepOptions>{ takeScreenshot: false };
    } else {
      this.options = options;
    }

    this.t = t;
    this.closure = cb;
  }

  setMetadata(key: string, value: string) {
    this.metadata[key] = value;
  }

  updateMetadata(metadata: { [key: string]: string }) {
    this.metadata = Object.assign(this.metadata, metadata);
  }

  async execute() {
    let ret;
    // pre-execute
    if (this.status === undefined)
      this.status = Status.PASSED;
    if (this.startTime === undefined)
      this.startTime = Date.now();
    if (this.endTime === undefined)
      this.endTime = this.startTime;
    // execute closure
    if (this.closure) {
      try {
        ret = await this.closure(this);
      } catch (error) {
        this.status = Status.FAILED;
        this.error = error;
      }
      this.endTime = Date.now();
    }
    // post-execute
    // log to stdout
    console.log(`${new Date(this.startTime).toLocaleString()} [${this.status}] ${this.text} (${this.endTime - this.startTime}ms)`);
    // take screenshot
    if (!this.error && (this.options.takeScreenshot || this.options.screenshotPath))
      this.screenshotPath = await this.takeScreenShot(this.options.screenshotPath);

    if (this.error)
      throw this.error;
    return ret;
  }

  async takeScreenShot(relativePath?: string, ): Promise<string> {
    if (this.t.ctx.runnerOpts.DISABLE_SCREENSHOT)
      return null;
    // FIXME: electron is not support screenshot
    if (await H.isElectron())
      return null;
    relativePath = `${relativePath || uuid()}.png`;
    const imagePath = path.join(this.t['testRun'].opts.screenshotPath, relativePath);
    await this.t.takeScreenshot(relativePath);
    if (this.t.ctx.runnerOpts.SCREENSHOT_WEBP_QUALITY)
      return await MiscUtils.convertToWebp(imagePath);
    return imagePath;
  }

  async withSubStep(stepOrText: IStep | string, cb: (step?: Step) => Promise<any>, options?: IStepOptions | boolean) {
    const step = new Step(this.t, stepOrText, cb, options);
    this.children.push(step);
    return await step.execute();
  }

  async addSubStep(stepOrText: IStep | string, options?: IStepOptions | boolean) {
    return await this.withSubStep(stepOrText, undefined, options);
  }
}


export class LogHelper {
  constructor(private t: TestController) {
  }

  async setup() {
    this.t.ctx.logs = [];
  }

  addStep(step: IStep) {
    this.t.ctx.logs.push(step);
  }

  async log(step: IStep | string, options?: IStepOptions | boolean) {
    await this.withLog(step, undefined, options);
  }

  async withLog(stepOrText: IStep | string, cb: (step?: IStep) => Promise<any>, options?: IStepOptions | boolean) {
    const step = new Step(this.t, stepOrText, cb, options);
    this.addStep(step);
    await step.execute();
  }
}
