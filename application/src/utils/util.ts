/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-14 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;

export {
  isElectron,
};
