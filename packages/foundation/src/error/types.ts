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
function errorConditionSelector(error: JError, conditions: ErrorCondition | ErrorCondition[]) {
  if (Array.isArray(conditions)) {
    return conditions.some(condition => stringMatch(condition.type, error.type) && condition.codes.some(code => stringMatch(code, error.code)));
  }
  return stringMatch(conditions.type, error.type) && conditions.codes.some(code => stringMatch(code, error.code));
}

function stringMatch(src: string, target: string): boolean {
  // consider use regexp to match string
  if (src === '*') {
    return true;
  }
  return src === target;
}

class JError extends Error {
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

type ErrorCondition = {
  type: string;
  codes: string[];
};

interface IErrorParser {
  readonly name: string;
  parse(error: Error): JError | null;
}

export {
  IErrorParser,
  JError,
  ERROR_TYPES,
  ErrorCondition,
  errorConditionSelector,
  stringMatch,
};
