/*
 * @Author: Paynter Chen
 * @Date: 2019-05-16 10:26:00
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';

function repeatString(
  repeatToken: string,
  n: number,
  baseString: string = '',
): string {
  return n > 0
    ? repeatString(repeatToken, n - 1, `${baseString}${repeatToken}`)
    : baseString;
}

function toString(arg: any, level: number = 0): string {
  if (_.isArray(arg)) {
    const nChar = repeatString(' ', level);
    return `[\n${nChar}${arg
      .map(it => `${nChar}${toString(it, level + 1)}`)
      .join(`\n${nChar}`)}\n${nChar}]`;
  }
  if (_.isObject(arg)) {
    const nChar = repeatString(' ', level);
    return Object.entries(arg)
      .map(([key, value]) => {
        return `\n${nChar}${key}: ${toString(value, level + 1)}`;
      })
      .join('');
  }
  return `${arg}`;
}

export { repeatString, toString };
