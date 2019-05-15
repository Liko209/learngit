/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 15:43:50
 * Copyright © RingCentral. All rights reserved.
 */

interface ICallerPhoneNumber {
  phoneNumber: string;
  value: string;
  usageType: string;
}

type DialerContainerProps = {};

type DialerContainerViewProps = {
  keypadEntered: boolean;
  isDialer: boolean;
  dtmf: (digit: string) => void;
  typeString: (digit: string) => void;
  dialerInputFocused?: boolean;
  playAudio: (digit: string) => void;
  chosenCallerPhoneNumber: string;
  callerPhoneNumberList: ICallerPhoneNumber[];
  setCallerPhoneNumber: (val: string) => void;
  hasDialerOpened: boolean;
  onAfterDialerOpen: () => void;
};

type DialerContainerViewState = {
  shouldShowToolTip: boolean;
};

export {
  DialerContainerProps,
  DialerContainerViewProps,
  DialerContainerViewState,
};
