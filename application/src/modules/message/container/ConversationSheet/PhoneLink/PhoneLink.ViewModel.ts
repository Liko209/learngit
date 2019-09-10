/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-27 10:20:56
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { PhoneLinkProps } from './types';
import { container } from 'framework/ioc';
import { TelephonyService } from '@/modules/telephony/service';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';

class PhoneLinkViewModel extends StoreViewModel<PhoneLinkProps> {
  @observable
  canUseTelephony: boolean = false;

  private _featuresFlagsService: FeaturesFlagsService = container.get(
    FeaturesFlagsService,
  );

  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  @computed
  get isRCUser() {
    return getGlobalValue(GLOBAL_KEYS.IS_RC_USER);
  }

  @action
  updateCanUseTelephony = async () => {
    this.canUseTelephony = await this._featuresFlagsService.canUseTelephony();
  };

  directCall = (phoneNumber: string) => {
    this._telephonyService.directCall(phoneNumber);
  };
}
export { PhoneLinkViewModel };
