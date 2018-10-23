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
  // '\n': '<br />',
  // '\r': '<br />',
  // Add more
};

const glipdown2Html = (str: string) => {
  // if (typeof str !== 'string') {
  //   return str;
  // }
  return str.replace(/\n|\r|&\S+?;/g, (match) => {
    // console.log('match: ', match);
    const char = DECODE[match];
    if (char) {
      return char;
    }
    return match;
  });
};
export { glipdown2Html };
