/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-09 15:01:59
 * Copyright © RingCentral. All rights reserved.
 */

export enum Status {
  PASSED = "passed",
  PENDING = "pending",
  SKIPPED = "skipped",
  FAILED = "failed",
  BROKEN = "broken",
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
    return `${this.startTime}\tduration=${this.endTime - this.startTime}\t${this.status} ${this.message}`;
  }
}
