/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 16:31:49
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { container } from 'framework';
import { TelephonyStore } from '../../store';
import { StoreViewModel } from '@/store/ViewModel';
import { DialerHeaderProps, DialerHeaderViewProps } from './types';

class DialerHeaderViewModel extends StoreViewModel<DialerHeaderProps>
  implements DialerHeaderViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get phone() {
    return this._telephonyStore.phoneNumber;
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
    const { contact } = this._telephonyStore;
    return contact ? contact.id : undefined;
  }
}

export { DialerHeaderViewModel };
