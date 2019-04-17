/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-04-04 18:25:31
 * Copyright © RingCentral. All rights reserved.
 */

function isEmailByReg(value: string) {
  const emailRegExp = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*\s/;
  return emailRegExp.test(value);
}

export { isEmailByReg };
