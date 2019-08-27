/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-26 13:25:56
 * Copyright © RingCentral. All rights reserved.
 */

import { RuiTooltipProps } from 'rcui/components/Tooltip';
import { CallerIdSelectorProps } from '../CallerIdSelector';
import { ChangeEvent, KeyboardEvent } from 'react';

interface ICallerPhoneNumber {
  phoneNumber: string;
  value: string;
  usageType: string;
  label?: string;
}

export type CallerIdSelectorProps = {
  tooltipProps: Pick<
    RuiTooltipProps,
    Exclude<keyof RuiTooltipProps, 'children'>
  >;
  callerIdProps: CallerIdSelectorProps;
};

export type GenericDialerPanelProps = {
  inputStringProps: 'forwardString' | 'inputString';
  onInputEnterKeyDown: (val: string) => void;
  CallActionBtn: React.ComponentType<any>[] | React.ComponentType<any>;
  displayCallerIdSelector: boolean;
  onContactSelected: (phoneNumber: string) => void;
  onAfterMount?: () => void;
  Back?: React.ComponentType<any>;
};

export type GenericDialerPanelViewProps = {
  clickToInput: (digit: string) => void;
  playAudio: (digit: string) => void;
  chosenCallerPhoneNumber: string;
  callerPhoneNumberList: ICallerPhoneNumber[];
  setCallerPhoneNumber: (val: string) => void;
  hasDialerOpened: boolean;
  onAfterDialerOpen: () => void;
  dialerFocused: boolean;
  shouldEnterContactSearch: boolean;
  shouldCloseToolTip: boolean;
  enteredDialer: boolean;
  dialerInputFocused: boolean;
  inputString: string;
  deleteAllInputString: () => void;
  deleteInputString: (startPos: number, endPos: number) => void;
  onBlur: () => void;
  onFocus: () => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  shouldDisplayRecentCalls: boolean;
  isTransferPage: boolean;
} & Pick<
  GenericDialerPanelProps,
  | 'onContactSelected'
  | 'displayCallerIdSelector'
  | 'CallActionBtn'
  | 'Back'
  | 'inputStringProps'
>;

export type GenericDialerPanelViewState = {
  shouldShowToolTip: boolean;
};
