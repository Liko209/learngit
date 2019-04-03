/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-02 12:06:38
 * Copyright © RingCentral. All rights reserved.
 */

const getFileName = (filename: string, truncation: number = -8) => {
  if (!filename) return '';

  const name = filename;
  const right = name.substr(truncation);
  const left = name.replace(right, '');
  return [left, right];
};

const truncateLongName = (name: string) => {
  const tailLength = 8;
  if (name && name.length > tailLength) {
    const left = name.substr(0, name.length - tailLength);
    const right = name.substr(-tailLength);
    return [left, right];
  }
  return [name, ''];
};

const getListItemSecondaryText = (text: string) => {
  if (!text) return '';

  const textArr = text.split('·');

  if (textArr.length) {
    const left = textArr[0];
    const right = textArr[1];
    return [left, right];
  }
  return [text, ''];
};

export { getFileName, truncateLongName, getListItemSecondaryText };
