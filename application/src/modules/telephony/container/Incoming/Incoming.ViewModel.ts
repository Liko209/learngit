/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed } from 'mobx';
import { container } from 'framework/ioc';
import { TelephonyStore } from '../../store';
import { StoreViewModel } from '@/store/ViewModel';
import { IncomingProps, IncomingViewProps } from './types';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';

class IncomingViewModel extends StoreViewModel<IncomingProps>
  implements IncomingViewProps {
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
  get name() {
    return this._telephonyStore.displayName;
  }

  @computed
  get uid() {
    return this._telephonyStore.uid;
  }

  @computed
  get isExt() {
    return this._telephonyStore.isExt;
  }

  @computed
  get incomingState() {
    return this._telephonyStore.incomingState;
  }

  @computed
  get isMultipleCall() {
    return this._telephonyStore.isMultipleCall;
  }

  @observable
  windowActivated?: boolean;

  constructor(props: IncomingProps) {
    super(props);
  }
}

export { IncomingViewModel };
