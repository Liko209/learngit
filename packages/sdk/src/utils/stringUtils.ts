/*
 * @Author: Paynter Chen
 * @Date: 2019-05-16 10:26:00
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { bytes } from 'foundation/utils';

function repeatString(
  repeatToken: string,
  n: number,
  baseString: string = '',
): string {
  return n > 0
    ? repeatString(repeatToken, n - 1, `${baseString}${repeatToken}`)
    : baseString;
}

const SUPPORT_TO_TEXT_TYPES = [
  '[object Object]',
  '[object Array]',
  '[object Null]',
  '[object Undefined]',
  '[object Number]',
  '[object String]',
  '[object Boolean]',
];

const COMPLEX_TYPE = ['[object Object]', '[object Array]'];

function toText(arg: any, level: number = 0): string {
  const type = Object.prototype.toString.call(arg);
  if (!SUPPORT_TO_TEXT_TYPES.includes(type)) return '';
  if (_.isArray(arg)) {
    const space = repeatString(' ', level + 1);
    return `[\n${space}${arg
      .filter(it =>
        SUPPORT_TO_TEXT_TYPES.includes(Object.prototype.toString.call(it)),
      )
      .map(it => `${toText(it, level + 1)}`)
      .join(`\n${space}`)}\n${repeatString(' ', level)}]`;
  }
  if (_.isObject(arg)) {
    const space = repeatString(' ', level);
    return Object.entries(arg)
      .filter(([, value]) =>
        SUPPORT_TO_TEXT_TYPES.includes(Object.prototype.toString.call(value)),
      )
      .map(([key, value]) => {
        const valueType = Object.prototype.toString.call(value);
        if (COMPLEX_TYPE.includes(valueType)) {
          return `${key}: \n${repeatString(' ', level + 1)}${toText(
            value,
            level + 1,
          )}`;
        }
        return `${key}: ${toText(value, level + 1)}`;
      })
      .join(`\n${space}`);
  }
  return `${arg}`;
}

export { repeatString, toText, bytes };
