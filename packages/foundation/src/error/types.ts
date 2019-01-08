/*
 * @Author: Paynter Chen
 * @Date: 2019-01-04 10:53:52
 * Copyright © RingCentral. All rights reserved.
 */
const ERROR_TYPES = {
  RUNTIME: 'RUNTIME',
  NETWORK: 'NETWORK',
  UNDEFINED: 'UNDEFINED',
};

class JError extends Error {
  constructor(public type: string, public code: string, public message: string = '', public payload?: { [key: string]: string }) {
    super(message);
    // fix instanceof
    // tslint:disable-next-line:max-line-length
    // see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
    Object.setPrototypeOf(this, new.target.prototype);
  }

  isMatch(conditions: ErrorCondition | ErrorCondition[]) {
    if (Array.isArray(conditions)) {
      return conditions.some(condition => condition.type === this.type && condition.codes.some(code => code === this.code));
    }
    return conditions.type === this.type && conditions.codes.some(code => code === this.code);
  }
}

type ErrorCondition = {
  type: string;
  codes: string[];
};

interface IErrorTransform {
  tryTransform(error: Error): JError | Error;
}

interface IErrorParser {
  readonly name: string;
  parse(error: Error): JError | null;
}

export {
  IErrorTransform,
  IErrorParser,
  JError,
  ERROR_TYPES,
  ErrorCondition,
};
