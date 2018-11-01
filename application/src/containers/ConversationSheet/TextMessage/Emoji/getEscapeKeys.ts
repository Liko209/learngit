/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-31 14:58:14
 * Copyright © RingCentral. All rights reserved.
 */

// Regular expression special characters
const regExpEscape = /\$|\(|\)|\*|\+|\.|\[|\]|\?|\/|\^|\{|\}|\|/g;

// keys escape
const getEscapeKeys = (keysOriginal: string[]) => {
  return keysOriginal.map((key: string) => {
    return key.replace(regExpEscape, (match: string) => `\\${match}`);
  });
};

export default getEscapeKeys;
