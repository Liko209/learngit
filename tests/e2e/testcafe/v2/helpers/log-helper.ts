import 'testcafe';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import { IStep, Step, Status, LogOptions } from '../models';
import { getLogger } from 'log4js';
import { H } from './utils';
import { MiscUtils } from '../utils';

const logger = getLogger(__filename);
logger.level = 'info';

export class LogHelper {
  constructor(private t: TestController) {
  }

  async setup() {
    this.t.ctx.logs = [];
    this.t['testRun'].startTime = new Date();
  }

  async takeScreenShot(): Promise<string> {
    if (await H.isElectron()) {
      return null;
    }
    const imageFileName = `${uuid()}.png`;
    await this.t.takeScreenshot(imageFileName);
    const imageFilePath = path.join(this.t['testRun'].opts.screenshotPath, imageFileName);
    const newImageFilePath = await MiscUtils.convertToWebp(imageFilePath);
    return newImageFilePath;
  }

  writeStep(step: IStep) {
    console.log(`${new Date(step.startTime).toLocaleString()} [${step.status}] ${step.message} (${step.endTime - step.startTime}ms)`);
    this.t.ctx.logs.push(step);
  }

  async log(
    step: IStep | string,
    args?: { [key: string]: any } | boolean | LogOptions,
    options?: boolean | LogOptions
  ) {
    let _args: { [key: string]: any }, _options: LogOptions;
    if (args instanceof LogOptions) {
      _options = args;
      _args = {};
    } else if (typeof args === 'boolean') {
      _options = <LogOptions>{ takeScreenShot: args };
      _args = {};
    } else {
      _args = Object.assign({}, args);
    }
    if (!_options) {
      if (options) {
        if (typeof options === 'boolean') {
          _options = <LogOptions>{ takeScreenShot: options };
        } else {
          _options = options;
        }
      } else {
        _options = <LogOptions>{ takeScreenShot: false };
      }
    }

    if (typeof step === 'string') {
      step = new Step(step, _args, this);
    } else {
      step = new Step(step.message, _args, this);
    }
    if (step.status === undefined)
      step.status = Status.PASSED;
    if (step.startTime === undefined)
      step.startTime = Date.now();
    if (step.endTime === undefined)
      step.endTime = step.startTime;
    if (_options.takeScreenShot)
      step.screenshotPath = await this.takeScreenShot();
    this.writeStep(step);
  }

  async withLog(step: IStep | string,
    args: { [key: string]: any } | ((step?: IStep) => Promise<any>),
    cb?: boolean | LogOptions | ((step?: IStep) => Promise<any>),
    options?: boolean | LogOptions
  ) {
    let _args: { [key: string]: any }, _options: LogOptions, _cb: Function;
    if (args instanceof Function) {
      _cb = args;
      _args = {};
    } else if (cb instanceof Function) {
      _cb = cb;
      _args = Object.assign({}, args);
    }

    if (_cb) {
      if (cb instanceof LogOptions) {
        _options = cb;
      } else if (typeof cb === 'boolean') {
        _options = <LogOptions>{ takeScreenShot: cb };
      }
    } else {
      throw new Error('cb is needed');
    }

    if (!_options) {
      if (options) {
        if (typeof options === 'boolean') {
          _options = <LogOptions>{ takeScreenShot: options };
        } else {
          _options = options;
        }
      } else {
        _options = <LogOptions>{ takeScreenShot: false };
      }
    }

    if (typeof step == 'string') {
      step = new Step(step, _args, this);
    } else {
      step = new Step(step.message, _args, this);
    }
    step.startTime = Date.now();
    try {
      const ret = await _cb(step);
      step.status = Status.PASSED;
      return ret;
    } catch (error) {
      step.status = Status.FAILED;
      _options.takeScreenShot = false;
      throw error;
    } finally {
      step.endTime = Date.now();
      if (_options.takeScreenShot)
        step.screenshotPath = await this.takeScreenShot();
      this.writeStep(step);
    }
  }
}
