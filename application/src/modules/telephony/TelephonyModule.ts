/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-01 23:14:11
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractModule, inject, Jupiter } from 'framework';
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

class TelephonyModule extends AbstractModule {
  static TAG: string = '[UI TelephonyModule] ';

  @inject(FeaturesFlagsService)
  private _FeaturesFlagsService: FeaturesFlagsService;
  @inject(TELEPHONY_SERVICE) private _TelephonyService: TelephonyService;
  @inject(LEAVE_BLOCKER_SERVICE) _leaveBlockerService: ILeaveBlockerService;
  @inject(TelephonyNotificationManager)
  private _telephonyNotificationManager: TelephonyNotificationManager;
  @inject(Jupiter) _jupiter: Jupiter;

  initTelephony = () => {
    this._TelephonyService.init();
    this._telephonyNotificationManager.init();
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
    this._jupiter.emitModuleInitial(TELEPHONY_SERVICE);

    const canUseTelephony = await this._FeaturesFlagsService.canUseTelephony();
    if (canUseTelephony) {
      this.initTelephony();
    }
    notificationCenter.on(
      SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
      this.onVoipCallingStateChanged,
    );
  }

  dispose() {
    notificationCenter.off(
      SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
      this.onVoipCallingStateChanged,
    );
    this._telephonyNotificationManager.dispose();
    this._leaveBlockerService.offLeave(this.handleLeave);
  }

  handleLeave = () => {
    if (this._TelephonyService.getAllCallCount() > 0) {
      mainLogger.info(
        `${
          TelephonyModule.TAG
        }Notify user has call count: ${this._TelephonyService.getAllCallCount()}`,
      );
      return true;
    }
    return false;
  }
}

export { TelephonyModule };
