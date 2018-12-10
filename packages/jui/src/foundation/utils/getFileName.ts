/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-02 12:06:38
 * Copyright © RingCentral. All rights reserved.
 */

const getFileName = (filename: string) => {
  if (!filename) return '';

  const name = filename;
  const right = name.substr(-7);
  const left = name.replace(right, '');
  return [left, right];
};

const truncateLongName = (name: string, maxLength: number) => {
  if (name && name.length > maxLength) {
    const length = maxLength;
    const left = name.substr(0, length - 7 - 3);
    const right = name.substr(-7);
    return `${left}... ${right}`;
  }
  return name;
};

export { getFileName, truncateLongName };
