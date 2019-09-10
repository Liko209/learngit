/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { CallActionsProps, CallActionsViewProps } from './types';
import { CALL_ACTION } from '../../interface/constant';
import { container } from 'framework/ioc';
import { TelephonyStore } from '../../store';

class CallActionsViewModel extends StoreViewModel<CallActionsProps>
  implements CallActionsViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get callActionsMap() {
    return {
      [CALL_ACTION.TRANSFER]: {
        shouldShowAction: !this.isIncomingPage,
      },
      [CALL_ACTION.REPLY]: {
        shouldShowAction: this.isIncomingPage,
      },
      [CALL_ACTION.FORWARD]: {
        shouldShowAction: this.isIncomingPage,
      },
      [CALL_ACTION.PARK]: {
        shouldShowAction: !this.isIncomingPage,
      },
      [CALL_ACTION.FLIP]: {
        shouldShowAction: !this.isIncomingPage,
      },
    };
  }

  @computed
  get isIncomingPage() {
    return this._telephonyStore.isIncomingCall;
  }

  @computed
  get isWarmTransferPage() {
    return this._telephonyStore.isWarmTransferPage;
  }
}

export { CallActionsViewModel };
