/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';

type SettingItemType = {
  [componentId: string]: ComponentType<any>;
};
export { SettingItemType };
