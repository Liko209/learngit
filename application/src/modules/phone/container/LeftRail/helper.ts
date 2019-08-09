/*
 * @Author: isaac.liu
 * @Date: 2019-05-29 09:15:18
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyTabs } from './config';
import { kDefaultPhoneTabPath } from './constant';

function isValidTab(tab: string) {
  return TelephonyTabs.find(({ path }) => path === tab);
}

function getValidPath(current: string) {
  if (isValidTab(current)) {
    return current;
  }
  return kDefaultPhoneTabPath;
}

export { isValidTab, getValidPath };
