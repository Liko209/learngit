/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 16:31:49
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { container } from 'framework';
import { TelephonyService } from '../../service';
import { TelephonyStore, INCOMING_STATE } from '../../store';
import { StoreViewModel } from '@/store/ViewModel';
import { DialerHeaderProps, DialerHeaderViewProps } from './types';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { ChangeEvent, KeyboardEvent } from 'react';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';

class DialerHeaderViewModel extends StoreViewModel<DialerHeaderProps>
  implements DialerHeaderViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get phone() {
    const { phoneNumber } = this._telephonyStore;
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

  deleteLastInputString = () => {
    this._telephonyService.deleteInputString();
  }

  deleteInputString = () => {
    this._telephonyService.deleteInputString(true);
  }

  onFocus = () => {
    this._telephonyStore.onDialerInputFocus();
  }

  onBlur = () => {
    this._telephonyStore.onDialerInputBlur();
  }

  onChange = (e: ChangeEvent<HTMLInputElement>) => {
    this._telephonyService.updateInputString(e.target.value);
  }

  onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && this._telephonyStore.inputString.length) {
      /**
       * TODO: move this call making & state changing logic down to SDK
       */
      this._makeCall(this._telephonyStore.inputString);
      this._telephonyStore.dialerCall();
    }
  }

  // FIXME: remove this logic by exposing the phone parser from SDK to view-model layer
  _makeCall = async (val: string) => {
    // make sure line 30 run before end()
    if (!(await this._telephonyService.makeCall(val))) {
      await new Promise(resolve => {
        requestAnimationFrame(resolve);
      });
      this._telephonyStore.end();
    }
  }

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
