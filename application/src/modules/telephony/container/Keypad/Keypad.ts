/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { KeypadView } from './Keypad.View';
import { KeypadViewModel } from './Keypad.ViewModel';
import { KeypadProps } from './types';

const Keypad = buildContainer<KeypadProps>({
  View: KeypadView,
  ViewModel: KeypadViewModel,
});

export { Keypad };
