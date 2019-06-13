/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-30 21:33:09
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiContainer, DialPad } from 'jui/pattern/Dialer';
import { End } from '../../End';
import { DialerContainerViewProps } from '../types';

type Props = Partial<DialerContainerViewProps>;

const emptyFunc = () => {};

export const KeypadPanel = React.memo((props: Props) => {
  const {
    dtmfThroughKeypad = emptyFunc,
    dtmfThroughKeyboard = emptyFunc,
    dialerFocused,
  } = props;

  const callAction = End;
  const keypadActions = (
    <DialPad
      makeMouseEffect={dtmfThroughKeypad}
      makeKeyboardEffect={dtmfThroughKeyboard}
      shouldHandleKeyboardEvts={dialerFocused}
    />
  );
  return <JuiContainer CallAction={callAction} KeypadActions={keypadActions} />;
});
