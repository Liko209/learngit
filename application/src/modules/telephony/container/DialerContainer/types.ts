import { RefObject } from 'react';
/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 15:43:50
 * Copyright © RingCentral. All rights reserved.
 */

interface ICallerPhoneNumber {
  phoneNumber: string;
  value: string;
  usageType: string;
  label?: string;
}

type DialerContainerProps = {
  dialerHeaderRef: RefObject<any>;
};

type DialerContainerViewProps = {
  keypadEntered: boolean;
  isDialer: boolean;
  dtmfThroughKeypad: (digit: string) => void;
  dtmfThroughKeyboard: (digit: string) => void;
  clickToInput: (digit: string) => void;
  dialerInputFocused?: boolean;
  playAudio: (digit: string) => void;
  chosenCallerPhoneNumber: string;
  callerPhoneNumberList: ICallerPhoneNumber[];
  setCallerPhoneNumber: (val: string) => void;
  hasDialerOpened: boolean;
  onAfterDialerOpen: () => void;
  dialerFocused: boolean;
};

type DialerContainerViewState = {
  shouldShowToolTip: boolean;
};

export {
  DialerContainerProps,
  DialerContainerViewProps,
  DialerContainerViewState,
};
