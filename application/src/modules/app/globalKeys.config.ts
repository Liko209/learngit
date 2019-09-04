/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 10:56:43
 * Copyright © RingCentral. All rights reserved.
 */

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const GLOBAL_HOT_KEYS = {
  OPEN_SEARCH: isMac ? ['command+f'] : ['ctrl+f'],
  SWITCH_CONVERSATION: isMac ? ['command+k'] : ['ctrl+k'],
};

export { GLOBAL_HOT_KEYS };
