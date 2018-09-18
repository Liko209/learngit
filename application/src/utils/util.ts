/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-14 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;

function isOnlyLetterOrNumbers(value: any) {
  if (typeof value === 'string') {
    const REG_NUM_LETTER = /^(?! *$)[0-9a-zA-Z]+$/;
    return REG_NUM_LETTER.test(value);
  }
  return false;
}

export {
  isElectron,
  isOnlyLetterOrNumbers,
};
