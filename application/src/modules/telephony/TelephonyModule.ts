/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-01 23:14:11
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractModule, inject } from 'framework';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { TelephonyService } from '@/modules/telephony/service';
import { ILeaveBlockerService } from '@/modules/leave-blocker/interface';
import { LeaveBlockerService } from '@/modules/leave-blocker/service';
import { mainLogger } from 'sdk';

class TelephonyModule extends AbstractModule {
  static TAG: string = '[UI TelephonyModule] ';

  @inject(FeaturesFlagsService)
  private _FeaturesFlagsService: FeaturesFlagsService;
  @inject(TelephonyService) private _TelephonyService: TelephonyService;
  @inject(LeaveBlockerService) _leaveBlockerService: ILeaveBlockerService;

  async bootstrap() {
    const canUseTelephony = await this._FeaturesFlagsService.canUseTelephony();
    if (canUseTelephony) {
      this._TelephonyService.init();
      this._leaveBlockerService.onLeave(this.handleLeave);
    }
  }

  dispose() {
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
