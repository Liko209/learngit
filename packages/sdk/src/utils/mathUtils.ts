/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-12 13:34:51
 * Copyright © RingCentral. All rights reserved
 */

// Provides utilities for handling math
const MAX_INTEGER = Number.MAX_SAFE_INTEGER;

function randomInt(): number {
  return Math.floor(Math.random() * MAX_INTEGER);
}

function versionHash(): number {
  return randomInt();
}

//  collision rate is less than 1/2^^122
function generateUUID(): string {
  let date = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (c: string) => {
      const r = (date + Math.random() * 16) % 16 | 0;
      date = Math.floor(date / 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    },
  );
  return uuid;
}

export { randomInt, versionHash, generateUUID };
