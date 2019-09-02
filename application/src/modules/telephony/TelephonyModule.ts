/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-01 23:14:11
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractModule } from 'framework/AbstractModule';
import { inject } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { IHomeService } from '@/modules/home/interface/IHomeService';
import { GlobalSearchService } from '@/modules/GlobalSearch/service/GlobalSearchService';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { TelephonyService } from '@/modules/telephony/service';
import { TELEPHONY_SERVICE } from './interface/constant';
import { ILeaveBlockerService } from '@/modules/leave-blocker/interface';
import { mainLogger } from 'foundation/log';
import { SERVICE } from 'sdk/service/eventKey';
import { notificationCenter } from 'sdk/service';
import { TelephonyNotificationManager } from './TelephonyNotificationManager';
import { TelephonySettingManager } from './TelephonySettingManager/TelephonySettingManager';
import { Dialer, Dialpad, Call } from './container';
import { config } from './telephony.config';

class TelephonyModule extends AbstractModule {
  static TAG: string = '[UI TelephonyModule] ';

  @inject(Jupiter)
  private _jupiter: Jupiter;
  @inject(FeaturesFlagsService)
  private _featuresFlagsService: FeaturesFlagsService;
  @inject(TELEPHONY_SERVICE)
  private _telephonyService: TelephonyService;
  @ILeaveBlockerService
  private _leaveBlockerService: ILeaveBlockerService;
  @inject(TelephonyNotificationManager)
  private _notificationManager: TelephonyNotificationManager;
  @inject(TelephonySettingManager)
  private _settingManager: TelephonySettingManager;
  @IHomeService
  private _homeService: IHomeService;
  @inject(GlobalSearchService)
  private _globalSearchService: GlobalSearchService;

  async bootstrap() {
    const canUseTelephony = await this._featuresFlagsService.canUseTelephony();
    if (canUseTelephony) {
      this._initTelephony();
    }
    notificationCenter.on(
      SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
      this._handleVoipCallingStateChanged,
    );
  }

  dispose() {
    notificationCenter.off(
      SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
      this._handleVoipCallingStateChanged,
    );
    this._disposeTelephony();
  }

  private async _initTelephony() {
    this._telephonyService.init();
    this._jupiter.emitModuleInitial(TELEPHONY_SERVICE);
    this._notificationManager.init();
    this._settingManager.init();
    this._leaveBlockerService.onLeave(this._handleLeave);
    this._homeService.registerExtension('root', Dialer);
    this._homeService.registerExtension('topBar', Dialpad);
    this._homeService.registerNavItem('telephony', await config.nav!());
    this._globalSearchService.registerExtension('searchItem', Call);
  }

  private _disposeTelephony() {
    this._notificationManager.dispose();
    this._settingManager.dispose();
    this._telephonyService.dispose();
    this._jupiter.emitModuleDispose(TELEPHONY_SERVICE);
    this._leaveBlockerService.offLeave(this._handleLeave);
    // TODO unregister home extensions
    this._globalSearchService.unregisterExtension('searchItem', Call);
  }

  private _handleVoipCallingStateChanged = (enabled: boolean) => {
    if (enabled) {
      this._initTelephony();
    } else {
      this._disposeTelephony();
    }
  };

  private _handleLeave = () => {
    if (this._telephonyService.getAllCallCount() > 0) {
      mainLogger.info(
        `${
          TelephonyModule.TAG
        }Notify user has call count: ${this._telephonyService.getAllCallCount()}`,
      );
      return true;
    }
    return false;
  };
}

export { TelephonyModule };
