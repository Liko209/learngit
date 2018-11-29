/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-27 17:13:37
 * Copyright © RingCentral. All rights reserved.
 */

function isAtMentions(value: string) {
  const atReg = /([^\w]|^)@\[\w+/;
  return atReg.test(value);
}

export { isAtMentions };
