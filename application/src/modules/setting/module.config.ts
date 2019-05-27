/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingService } from './service';
import { SettingStore } from './store';
import { SettingModule } from './SettingModule';
import { SETTING_SERVICE } from './interface';

const config = {
  entry: SettingModule,
  provides: [
    {
      name: SETTING_SERVICE,
      value: SettingService,
    },
    SettingStore,
  ],
};

export { config };
