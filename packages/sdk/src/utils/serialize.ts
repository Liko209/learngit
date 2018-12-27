/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-15 16:36:53
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
export function serializeUrlParams(params: object) {
  const str: string[] = [];

  Object.entries(params).forEach(([key, value]) => {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      str.push(`${key}=${value}`);
    }
  });
  return str.join('&');
}

export function omitLocalProperties(
  data: object | object[],
): object | object[] {
  if (Array.isArray(data)) {
    return data.map(item => omitLocalProperties(item));
  }
  const localDataKeys = ['id', '_delta'];
  return _.omitBy(data, (value, key) => {
    return key.startsWith('__') || localDataKeys.indexOf(key) >= 0;
  });
}
