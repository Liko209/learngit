/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-01 23:14:11
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractModule, inject, Jupiter } from 'framework';
import { HomeService } from '@/modules/home/service/HomeService';
import { GlobalSearchService } from '@/modules/GlobalSearch/service/GlobalSearchService';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { TelephonyService } from '@/modules/telephony/service';
import { TELEPHONY_SERVICE } from './interface/constant';
import {
  LEAVE_BLOCKER_SERVICE,
  ILeaveBlockerService,
} from '@/modules/leave-blocker/interface';
import { mainLogger } from 'sdk';
import { SERVICE } from 'sdk/service/eventKey';
import { notificationCenter } from 'sdk/service';
import { TelephonyNotificationManager } from './TelephonyNotificationManager';
import { TelephonySettingManager } from './TelephonySettingManager/TelephonySettingManager';
import { Dialer, Dialpad, Call } from './container';

class TelephonyModule extends AbstractModule {
  static TAG: string = '[UI TelephonyModule] ';

  @inject(FeaturesFlagsService)
  private _FeaturesFlagsService: FeaturesFlagsService;
  @inject(TELEPHONY_SERVICE) private _telephonyService: TelephonyService;
  @inject(LEAVE_BLOCKER_SERVICE) _leaveBlockerService: ILeaveBlockerService;
  @inject(TelephonyNotificationManager)
  private _telephonyNotificationManager: TelephonyNotificationManager;
  @inject(TelephonySettingManager)
  private _telephonySettingManager: TelephonySettingManager;
  @inject(Jupiter) _jupiter: Jupiter;

  @inject(HomeService) _homeService: HomeService;
  @inject(GlobalSearchService) _globalSearchService: GlobalSearchService;

  initTelephony = () => {
    this._telephonyService.init();
    this._telephonyNotificationManager.init();
    this._telephonySettingManager.init();
    this._leaveBlockerService.onLeave(this.handleLeave);
  }

  onVoipCallingStateChanged = (enabled: boolean) => {
    if (enabled) {
      this.initTelephony();
    } else {
      this._telephonyNotificationManager.dispose();
      this._leaveBlockerService.offLeave(this.handleLeave);
    }
  }

  async bootstrap() {
    const canUseTelephony = await this._FeaturesFlagsService.canUseTelephony();
    if (canUseTelephony) {
      this.initTelephony();
    }
    notificationCenter.on(
      SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
      this.onVoipCallingStateChanged,
    );

    this._jupiter.emitModuleInitial(TELEPHONY_SERVICE);
    this._homeService.registerExtension('root', Dialer);
    this._homeService.registerExtension('topBar', Dialpad);
    this._globalSearchService.registerExtension('searchItem', Call);
  }

  dispose() {
    notificationCenter.off(
      SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
      this.onVoipCallingStateChanged,
    );
    this._telephonyNotificationManager.dispose();
    this._telephonyService.dispose();
    this._leaveBlockerService.offLeave(this.handleLeave);
  }

  handleLeave = () => {
    if (this._telephonyService.getAllCallCount() > 0) {
      mainLogger.info(
        `${
          TelephonyModule.TAG
        }Notify user has call count: ${this._telephonyService.getAllCallCount()}`,
      );
      return true;
    }
    return false;
  }
}

export { TelephonyModule };
