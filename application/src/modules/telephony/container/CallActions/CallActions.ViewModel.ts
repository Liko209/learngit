/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */
// import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { CallActionsProps, CallActionsViewProps } from './types';
import { container } from 'framework';
import { TelephonyStore } from '../../store';

class CallActionsViewModel extends StoreViewModel<CallActionsProps>
  implements CallActionsViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  directReply = () => {
    this._telephonyStore.directReply();
  }
}

export { CallActionsViewModel };
