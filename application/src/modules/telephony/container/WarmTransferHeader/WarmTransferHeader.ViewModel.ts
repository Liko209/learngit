/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-28 02:17:01
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { container } from 'framework/ioc';
import { StoreViewModel } from '@/store/ViewModel';
import { Props } from './types';
import { TelephonyStore } from '../../store';
import { TelephonyService } from '../../service';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { analyticsCollector } from '@/AnalyticsCollector';

class WarmTransferHeaderViewModel extends StoreViewModel<Props> {
  @observable
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get switchCallItems() {
    return this._telephonyStore.rawCalls;
  }

  @computed
  get currentCallId() {
    return this._telephonyStore.currentCallId;
  }

  switchCall = (callId: number) => {
    this._telephonyStore.switchCurrentCall(callId);
    this._telephonyService.holdOrUnhold();
  };

  endCall = () => {
    analyticsCollector.cancelTransferCall();
    this._telephonyService.hangUp(this.switchCallItems[0].id);
    this._telephonyStore.leaveWarmTransferPage();
  };
}

export { WarmTransferHeaderViewModel };
