/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-09 15:01:59
 * Copyright © RingCentral. All rights reserved.
 */
import { PASS, FAILED } from '../config';

export enum Status {
  PASSED = 'passed',
  PENDING = 'pending',
  SKIPPED = 'skipped',
  FAILED = 'failed',
  BROKEN = 'broken',
}

export const Allure2Dashboard = {
  'passed': PASS,
  'failed': FAILED
}

export class AllureStep {

  constructor(
    public message: string,
    public status: Status,
    public startTime: number,
    public endTime: number,
    public screenshotPath: string | undefined,
    public children: AllureStep[],
  ) {
  }

  toString() {
    let log: string = `${this.startTime}\tduration=${this.endTime - this.startTime}\t${this.status} ${this.message}`;
    if (this.screenshotPath) {
      log += '\tscreenshot:' + this.screenshotPath;
    }
    return log;
  }
}
