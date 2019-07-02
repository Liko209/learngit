/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 16:31:49
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action } from 'mobx';
import { container } from 'framework';
import { TelephonyService } from '../../service';
import { TelephonyStore, INCOMING_STATE } from '../../store';
import { StoreViewModel } from '@/store/ViewModel';
import { DialerHeaderProps, DialerHeaderViewProps } from './types';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { ChangeEvent } from 'react';

class DialerHeaderViewModel extends StoreViewModel<DialerHeaderProps>
  implements DialerHeaderViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get phone() {
    const { phoneNumber } = this._telephonyStore;
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

  deleteLastInputString = () => {
    this._deleteInputString();
  }

  deleteInputString = () => {
    this._deleteInputString(true);
  }

  onFocus = () => {
    this._telephonyStore.onDialerInputFocus();
  }

  onBlur = () => {
    this._telephonyStore.onDialerInputBlur();
  }

  @action
  onChange = (e: ChangeEvent<HTMLInputElement>) => {
    this._updateInputString(e.target.value);
  }

  private _updateInputString = this._telephonyService.updateInputStringFactory(
    'forwardString',
  );

  private _deleteInputString = this._telephonyService.deleteInputStringFactory(
    'forwardString',
  );

  @computed
  get uid() {
    return this._telephonyStore.uid;
  }

  @computed
  get shouldDisplayDialer() {
    return this._telephonyStore.shouldDisplayDialer;
  }

  @computed
  get inputString() {
    return this._telephonyStore.inputString;
  }

  @computed
  get forwardString() {
    return this._telephonyStore.forwardString;
  }

  @computed
  get isForward() {
    return this._telephonyStore.incomingState === INCOMING_STATE.FORWARD;
  }

  @computed
  get dialerInputFocused() {
    return this._telephonyStore.dialerInputFocused;
  }
}

export { DialerHeaderViewModel };
