/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-22 13:03:39
 * Copyright © RingCentral. All rights reserved.
 */

class BaseError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);

    this.code = code;
    // fix instanceof
    // tslint:disable-next-line:max-line-length
    // see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export { BaseError };
