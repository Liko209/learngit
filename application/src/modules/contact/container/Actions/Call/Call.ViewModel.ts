/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-26 14:29:40
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { container } from 'framework/ioc';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { TelephonyService } from '@/modules/telephony/service';
import { analyticsCollector } from '@/AnalyticsCollector';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';

import { CallProps } from './types';

class CallViewModel extends StoreViewModel<CallProps> {
  @computed
  get isMe() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID) === this.props.id;
  }

  get _telephonyService() {
    return container.get<TelephonyService>(TELEPHONY_SERVICE);
  }

  doCall = async (e: React.MouseEvent) => {
    const { phoneNumber, entity, contactType } = this.props;
    e.stopPropagation();
    await this._telephonyService.directCall(phoneNumber);
    analyticsCollector.phoneCallBack(entity);
    analyticsCollector.contactActions(entity, 'call', contactType);
  };
}

export { CallViewModel };
