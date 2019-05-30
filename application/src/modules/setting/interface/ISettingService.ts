/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingItemType } from '../type';

interface ISettingService {
  registerSettingItem(item: SettingItemType): void;
  unRegisterSettingItem(key: string): void;
}

export { ISettingService };
