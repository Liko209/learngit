/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 15:43:50
 * Copyright © RingCentral. All rights reserved.
 */
import { ChangeEvent, KeyboardEvent } from 'react';

type DialerHeaderProps = {
  Back?: React.ComponentType<any>;
};

type DialerHeaderViewProps = {
  isExt: boolean;
  name: string;
  phone?: string;
  uid?: number;
  shouldDisplayDialer: boolean;
  inputString?: string;
  forwardString?: string;
  isForward?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  dialerInputFocused: boolean;
  deleteLastInputString: () => void;
  deleteInputString: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
} & DialerHeaderProps;

export { DialerHeaderProps, DialerHeaderViewProps };
