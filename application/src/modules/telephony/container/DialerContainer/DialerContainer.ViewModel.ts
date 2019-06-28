/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 16:31:49
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { DialerContainerProps, DialerContainerViewProps } from './types';
import { container } from 'framework';
import { computed } from 'mobx';
import { TelephonyStore, INCOMING_STATE } from '../../store';
import { TelephonyService } from '../../service';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { RefObject } from 'react';
import ReactDOM from 'react-dom';
import { debounce } from 'lodash';
import { focusCampo } from '../../helpers';
import { CALL_WINDOW_STATUS } from '../../FSM';

class DialerContainerViewModel extends StoreViewModel<DialerContainerProps>
  implements DialerContainerViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _dialerContainerRef: RefObject<any>;

  constructor(...args: DialerContainerProps[]) {
    super(...args);
    if (args.length) {
      this._dialerContainerRef = args[0].dialerHeaderRef;
    }
  }

  @computed
  get enteredDialer() {
    return this._telephonyStore.enteredDialer;
  }

  @computed
  get keypadEntered() {
    return this._telephonyStore.keypadEntered;
  }

  @computed
  get isDialer() {
    return (
      this._telephonyStore.shouldDisplayDialer &&
      (!this.trimmedInputString.length ||
        (!!this.trimmedInputString.length &&
          this._telephonyStore.firstLetterEnteredThroughKeypad))
    );
  }

  @computed
  get isForward() {
    return this._telephonyStore.incomingState === INCOMING_STATE.FORWARD;
  }

  @computed
  get dialerInputFocused() {
    return this._telephonyStore.dialerInputFocused;
  }

  @computed
  get chosenCallerPhoneNumber() {
    return this._telephonyStore.chosenCallerPhoneNumber;
  }

  @computed
  get callerPhoneNumberList() {
    return this._telephonyStore.callerPhoneNumberList.map(el => ({
      value: el.phoneNumber,
      usageType: el.usageType,
      phoneNumber: el.phoneNumber,
      label: el.label,
    }));
  }
  @computed
  get hasDialerOpened() {
    return this._telephonyStore.dialerOpenedCount !== 0;
  }

  @computed
  get shouldCloseToolTip() {
    return (
      this._telephonyStore.startMinimizeAnimation ||
      this._telephonyStore.callWindowState === CALL_WINDOW_STATUS.MINIMIZED
    );
  }

  @computed
  get canClickToInput() {
    return (
      this._telephonyStore.inputString.length <
      this._telephonyStore.maximumInputLength
    );
  }

  @computed
  get dialerFocused() {
    return (
      this._telephonyStore.dialerFocused && this._telephonyStore.keypadEntered
    );
  }

  @computed
  get trimmedInputString() {
    return this._telephonyStore.inputString.trim();
  }

  @computed
  get shouldEnterContactSearch() {
    return this._telephonyStore.shouldEnterContactSearch;
  }

  dtmfThroughKeyboard = (digit: string) => {
    if (!this._telephonyStore.dialerFocused) {
      return;
    }
    this.dtmfThroughKeypad(digit);
  }

  dtmfThroughKeypad = (digit: string) => {
    this.playAudio(digit);
    this._telephonyService.dtmf(digit);
  }

  playAudio = (digit: string) => {
    if (!this.canClickToInput) {
      return;
    }
    this._telephonyService.playBeep(digit);
  }

  private _focusCampo = debounce(focusCampo, 30, {
    leading: false,
    trailing: true,
  });

  clickToInput = (str: string) => {
    if (!this.canClickToInput) {
      return;
    }
    if (!this.trimmedInputString.length && !this.isForward) {
      this._telephonyStore.enterFirstLetterThroughKeypad();
    }
    this.playAudio(str);
    this._telephonyService.concatInputString(str);

    if (!this._dialerContainerRef) {
      return;
    }
    const input = (ReactDOM.findDOMNode(
      this._dialerContainerRef.current,
    ) as HTMLDivElement).querySelector('input');

    if (input && this._telephonyStore.inputString) {
      this._focusCampo(input);
    }
  }

  setCallerPhoneNumber = (str: string) =>
    this._telephonyService.setCallerPhoneNumber(str)

  onAfterDialerOpen = () => this._telephonyService.onAfterDialerOpen();
}

export { DialerContainerViewModel };
