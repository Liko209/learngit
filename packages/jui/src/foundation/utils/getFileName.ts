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

export { getFileName };
