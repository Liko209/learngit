/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-26 13:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { GenericDialerPanelProps } from './types';
import { container } from 'framework/ioc';
import { computed } from 'mobx';
import { TelephonyStore } from '../../store';
import { TelephonyService } from '../../service';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { CALL_WINDOW_STATUS } from '../../FSM';
import { ChangeEvent, KeyboardEvent } from 'react';
import { toFirstLetterUpperCase } from '../../helpers';

class GenericDialerPanelViewModel extends StoreViewModel<
  GenericDialerPanelProps
> {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _concatInputString: (str: string) => void;
  private _updateInputString: (str: string) => void;
  private _deleteInputString: (
    clearAll: boolean,
    start?: number,
    end?: number,
  ) => void;

  constructor(props: GenericDialerPanelProps) {
    super(props);
    this._concatInputString = this._telephonyService.concatInputStringFactory(
      props.inputStringProps,
    );

    this._updateInputString = this._telephonyService.updateInputStringFactory(
      props.inputStringProps,
    );

    this._deleteInputString = this._telephonyService.deleteInputStringFactory(
      props.inputStringProps,
    );
  }

  @computed
  get enteredDialer() {
    return this._telephonyStore.enteredDialer;
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
    return this.inputString.length < this._telephonyStore.maximumInputLength;
  }

  @computed
  get trimmedInputString() {
    return this.inputString.trim();
  }

  @computed
  get shouldEnterContactSearch() {
    return (
      !!this.inputString.trim().length &&
      !this._telephonyStore[
        `firstLetterEnteredThroughKeypadFor${toFirstLetterUpperCase(
          this.props.inputStringProps,
        )}`
      ]
    );
  }

  @computed
  get shouldDisplayRecentCalls() {
    return (
      this._telephonyStore.isRecentCalls &&
      this._telephonyStore.shouldDisplayRecentCalls
    );
  }

  @computed
  get inputString() {
    return this._telephonyStore[this.props.inputStringProps];
  }

  @computed
  get isTransferPage() {
    return this._telephonyStore.isTransferPage;
  }

  playAudio = (digit: string) => {
    if (!this.canClickToInput) {
      return;
    }
    this._telephonyService.playBeep(digit);
  };

  // input using dialer's keypad instead of keyboard
  clickToInput = (str: string) => {
    if (!this.canClickToInput) {
      return;
    }
    if (!this.trimmedInputString.length) {
      this._telephonyStore[
        `enterFirstLetterThroughKeypadFor${toFirstLetterUpperCase(
          this.props.inputStringProps,
        )}`
      ]();
    }
    this.playAudio(str);
    this._concatInputString(str);
  };

  setCallerPhoneNumber = (str: string) =>
    this._telephonyService.setCallerPhoneNumber(str);

  onAfterDialerOpen = () =>
    this.props.onAfterMount && this.props.onAfterMount();

  deleteInputString = (startPos: number, endPos: number) => {
    this._deleteInputString(false, startPos, endPos);
  };

  deleteAllInputString = () => {
    this._deleteInputString(true);
  };

  onFocus = () => {
    this._telephonyStore.onDialerInputFocus();
  };

  onBlur = () => {
    this._telephonyStore.onDialerInputBlur();
  };

  onChange = (e: ChangeEvent<HTMLInputElement>) => {
    this._updateInputString(e.target.value);
  };

  onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // since material-ui called onBlur on input
    // we call this to make sure focus status right
    this._telephonyStore.onDialerInputFocus();
    // let <ContactSearchList/> handle its own `Enter` key event
    if (
      !this.shouldEnterContactSearch &&
      e.key === 'Enter' &&
      this.inputString.length
    ) {
      this.props.onInputEnterKeyDown(this.inputString);
    }
  };
}

export { GenericDialerPanelViewModel };
