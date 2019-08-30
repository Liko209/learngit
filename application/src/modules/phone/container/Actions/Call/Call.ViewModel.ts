/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-26 14:29:40
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { container } from 'framework/ioc';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { TelephonyService } from '@/modules/telephony/service';
import { analyticsCollector } from '@/AnalyticsCollector';
import { PHONE_ITEM_ACTIONS } from '@/AnalyticsCollector/constants';

import { CallProps, ENTITY_TYPE } from './types';

class CallViewModel extends StoreViewModel<CallProps> {
  get _telephonyService() {
    return container.get<TelephonyService>(TELEPHONY_SERVICE);
  }

  doCall = async () => {
    const { caller, entity, tabName } = this.props;
    const toNumber = caller.extensionNumber || caller.phoneNumber;
    // actions ensure caller exist
    await this._telephonyService.directCall(toNumber!);
    analyticsCollector.phoneCallBack(
      entity === ENTITY_TYPE.CALL_LOG ? 'callHistory' : 'voicemailList',
    );
    analyticsCollector.phoneActions(tabName, PHONE_ITEM_ACTIONS.CALL);
  };
}

export { CallViewModel };
