/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { CallActionsProps, CallActionsViewProps } from './types';
import { CALL_ACTION } from '../../interface/constant';
import { container } from 'framework';
import { TelephonyStore } from '../../store';
import { CALL_STATE } from '../../FSM';

class CallActionsViewModel extends StoreViewModel<CallActionsProps>
  implements CallActionsViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get callActionsMap() {
    return {
      [CALL_ACTION.REPLY]: {
        shouldShowAction: this._shouldShowReplyOption,
      },
      // [CALL_ACTION.FORWARD]: {
      //   shouldShowAction: !this._isEventOrTask,
      // },
    };
  }

  @computed
  private get _shouldShowReplyOption() {
    return this._telephonyStore.callState === CALL_STATE.INCOMING;
  }

  @computed
  get shouldDisableCallActions() {
    return Object.values(this.callActionsMap).every(
      action => !action.shouldShowAction,
    );
  }
}

export { CallActionsViewModel };
