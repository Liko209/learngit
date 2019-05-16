/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingService } from './service';
import { SettingStore } from './store';
import { SettingModule } from './SettingModule';
import { ISettingService } from './interface';

const config = {
  entry: SettingModule,
  provides: [
    {
      name: ISettingService,
      value: SettingService,
    },
    SettingStore,
  ],
};

export { config };
