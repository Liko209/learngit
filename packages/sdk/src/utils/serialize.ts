/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-15 16:36:53
 * Copyright © RingCentral. All rights reserved.
 */
export function serializeUrlParams(params: object) {
  const str: string[] = [];

  Object.entries(params).forEach(([key, value]) => {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      str.push(`${key}=${value}`);
    }
  });
  return str.join('&');
}
