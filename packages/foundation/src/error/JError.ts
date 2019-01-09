/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:07:36
 * Copyright © RingCentral. All rights reserved.
 */
import { ErrorCondition } from './types';
import { errorConditionSelector } from './utils';

export class JError extends Error {
  constructor(public type: string, public code: string, public message: string = '', public payload?: { [key: string]: string }) {
    super(message);
    // fix instanceof
    // tslint:disable-next-line:max-line-length
    // see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
    Object.setPrototypeOf(this, new.target.prototype);
  }

  isMatch(conditions: ErrorCondition | ErrorCondition[]) {
    return errorConditionSelector(this, conditions);
  }
}
