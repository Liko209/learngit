/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 14:45:11
 * Copyright © RingCentral. All rights reserved.
 */
import { ErrorCondition, TError } from './types';

export function stringMatch(src: string, target: string): boolean {
  // consider use regexp to match string
  if (src === '*') {
    return true;
  }
  return src === target;
}

function isErrorMatchCondition(error: TError, condition: ErrorCondition) {
  if (!condition) {
    return false;
  }
  const excludes = condition.excludeCodes || [];
  return (
    stringMatch(condition.type, error.type) &&
    !excludes.some(code => stringMatch(code, error.code)) &&
    condition.codes.some(code => stringMatch(code, error.code))
  );
}

export function errorConditionSelector(
  error: TError,
  conditions: ErrorCondition | ErrorCondition[],
) {
  if (Array.isArray(conditions)) {
    return conditions.some(condition =>
      isErrorMatchCondition(error, condition),
    );
  }
  return isErrorMatchCondition(error, conditions);
}
