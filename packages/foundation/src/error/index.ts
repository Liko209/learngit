/*
 * @Author: Paynter Chen
 * @Date: 2019-01-04 10:53:56
 * Copyright © RingCentral. All rights reserved.
 */
import { ErrorParser } from './ErrorParser';
import { runtimeErrorParser } from './runtime';
import { errorConditionSelector, ErrorCondition } from './types';
const errorParser = new ErrorParser();
errorParser.register(runtimeErrorParser);

const isErrorMatch = (error: Error, ...conditions: ErrorCondition[]) => {
  return errorConditionSelector(errorParser.parse(error), conditions);
};

export {
  errorParser,
  isErrorMatch,
};

export {
  IErrorParser,
  JError,
  ERROR_TYPES,
  ErrorCondition,
} from './types';
export * from './network';
export * from './runtime';
