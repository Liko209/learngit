/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-12 16:57:23
 * Copyright © RingCentral. All rights reserved.
 */

const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;

export default isElectron;
