/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-01 23:14:11
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractModule, inject } from 'framework';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { TelephonyService } from '@/modules/telephony/service';

class TelephonyModule extends AbstractModule {
  @inject(FeaturesFlagsService)
  private _FeaturesFlagsService: FeaturesFlagsService;
  @inject(TelephonyService) private _TelephonyService: TelephonyService;

  async bootstrap() {
    const canUseTelephony = await this._FeaturesFlagsService.canUseTelephony();
    if (canUseTelephony) {
      this._TelephonyService.init();
    }
  }
}

export { TelephonyModule };
