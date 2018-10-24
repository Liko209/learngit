/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-23 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
const DECODE = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&nbsp;': ' ',
  '&quot;': '"',
  '&copy;': '©',
  '&#x27;': "'",
};

const glipdown2Html = (str: string) => {
  return str.replace(/\n|\r|&\S+?;/g, (match) => {
    const char = DECODE[match];
    if (char) {
      return char;
    }
    return match;
  });
};
export { glipdown2Html };
