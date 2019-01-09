/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 14:45:11
 * Copyright © RingCentral. All rights reserved.
 */
import { JError } from './JError';
import { ErrorCondition } from './types';
export function errorConditionSelector(error: JError, conditions: ErrorCondition | ErrorCondition[]) {
  if (Array.isArray(conditions)) {
    return conditions.some(condition => stringMatch(condition.type, error.type) && condition.codes.some(code => stringMatch(code, error.code)));
  }
  return stringMatch(conditions.type, error.type) && conditions.codes.some(code => stringMatch(code, error.code));
}

export function stringMatch(src: string, target: string): boolean {
  // consider use regexp to match string
  if (src === '*') {
    return true;
  }
  return src === target;
}
