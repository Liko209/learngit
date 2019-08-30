/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 10:56:43
 * Copyright © RingCentral. All rights reserved.
 */

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const GLOBAL_HOT_KEYS: any = {};
if (isMac) {
  GLOBAL_HOT_KEYS.OPEN_SEARCH = ['command+f'];
  GLOBAL_HOT_KEYS.SWITCH_CONVERSATION = ['command+k'];
} else {
  GLOBAL_HOT_KEYS.OPEN_SEARCH = ['ctrl+f'];
  GLOBAL_HOT_KEYS.SWITCH_CONVERSATION = ['ctrl+k'];
}

export { GLOBAL_HOT_KEYS };
