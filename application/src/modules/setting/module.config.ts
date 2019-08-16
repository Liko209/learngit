/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import { ISettingService } from '@/interface/setting';
import { SettingStore } from './store/SettingStore';
import { SettingService } from './service/SettingService';
import { GeneralSettingManager } from './manager/general';
import { NotificationSoundSettingManager } from './manager/notificationSound';
import { SettingModule } from './SettingModule';
import { PlaceholderSettingManager } from './manager/placeholder/PlaceholderSettingManager';

const config: ModuleConfig = {
  entry: SettingModule,
  provides: [
    SettingStore,
    {
      name: ISettingService,
      value: SettingService,
    },
    // build in settings
    GeneralSettingManager,
    NotificationSoundSettingManager,
    PlaceholderSettingManager,
  ],
};

export { config };
