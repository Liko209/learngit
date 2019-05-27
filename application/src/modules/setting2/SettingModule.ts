/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule, inject } from 'framework';
import { IHomeService } from '@/modules/home/interface/IHomeService';
import { GeneralSettingManager } from './manager/general';
import { NotificationSoundSettingManager } from './manager/notificationSound';
import { Setting } from './container/Setting';
import { SETTING_ROUTE_ROOT } from './constant';

class SettingModule extends AbstractModule {
  @IHomeService private _homeService: IHomeService;
  @inject(GeneralSettingManager)
  private _generalSettingManager: GeneralSettingManager;
  @inject(NotificationSoundSettingManager)
  private _notificationSoundSettingManager: NotificationSoundSettingManager;

  bootstrap() {
    this._initRoute();
    this._generalSettingManager.init();
    this._notificationSoundSettingManager.init();
  }

  private _initRoute() {
    this._homeService.registerRoute('setting2', {
      path: SETTING_ROUTE_ROOT,
      component: Setting,
    });
  }

  dispose() {
    this._generalSettingManager.dispose();
    this._notificationSoundSettingManager.dispose();
  }
}

export { SettingModule };
