/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-25 16:54:40
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { container } from 'framework/ioc';
import { TelephonyStore } from '../../store';
import { StoreViewModel } from '@/store/ViewModel';
import { CallCtrlPanelProps, CallCtrlPanelViewProps } from './types';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';

class CallCtrlPanelViewModel extends StoreViewModel<CallCtrlPanelProps>
  implements CallCtrlPanelViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get phone() {
    const phoneNumber = this._telephonyStore.phoneNumber;
    if (phoneNumber) {
      return formatPhoneNumber(phoneNumber);
    }
    return phoneNumber;
  }

  @computed
  get isExt() {
    return this._telephonyStore.isExt;
  }

  @computed
  get name() {
    return this._telephonyStore.displayName;
  }

  @computed
  get uid() {
    return this._telephonyStore.uid;
  }

  @computed
  get direction() {
    return this._telephonyStore.activeCallDirection;
  }

  @computed
  get isWarmTransferPage() {
    return this._telephonyStore.isWarmTransferPage;
  }

  @computed
  get isConference() {
    return this._telephonyStore.isConference;
  }
}

export { CallCtrlPanelViewModel };
