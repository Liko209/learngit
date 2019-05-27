/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { CallActionsProps, CallActionsViewProps } from './types';
import { container } from 'framework';
import { TelephonyStore } from '../../store';
import { CALL_STATE } from '../../FSM';

enum CALL_ACTION {
  REPLY = 'reply',
}

class CallActionsViewModel extends StoreViewModel<CallActionsProps>
  implements CallActionsViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  private _directReply = () => {
    this._telephonyStore.directReply();
  }

  @computed
  private get _shouldShowReplyOption() {
    return this._telephonyStore.callState === CALL_STATE.INCOMING;
  }

  @computed
  get callActions() {
    return [
      {
        label: CALL_ACTION.REPLY,
        handleClick: this._directReply,
        disabled: !this._shouldShowReplyOption,
      },
    ];
  }

  @computed
  get shouldDisableCallActions() {
    return this.callActions.every(action => action.disabled);
  }
}

export { CallActionsViewModel };
