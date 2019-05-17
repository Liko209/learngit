/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { Jupiter, ModuleConfig } from 'framework';
import { SettingService } from './service';
import { SettingStore } from './store';
import { SettingModule } from './SettingModule';
import { ISettingService } from './interface';

const config: ModuleConfig = {
  entry: SettingModule,
  binding: (jupiter: Jupiter) => {
    jupiter.registerService(ISettingService, SettingService);
    jupiter.registerClass(SettingStore);
  },
};

export { config };
