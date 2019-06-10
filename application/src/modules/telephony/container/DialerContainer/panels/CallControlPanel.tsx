/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-30 21:33:07
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiContainer } from 'jui/pattern/Dialer';
import { End } from '../../End';
import { Mute } from '../../Mute';
import { Keypad } from '../../Keypad';
import { Hold } from '../../Hold';
import { Add } from '../../Add';
import { Record } from '../../Record';
import { CallActions } from '../../CallActions';

export const CallControlPanel = React.memo(() => {
  const callAction = End;
  const keypadActions = [Mute, Keypad, Hold, Add, Record, CallActions];
  return <JuiContainer CallAction={callAction} KeypadActions={keypadActions} />;
});
