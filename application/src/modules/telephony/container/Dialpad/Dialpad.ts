/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-22 14:15:57
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { DialpadView } from './Dialpad.View';
import { DialpadViewModel } from './Dialpad.ViewModel';
import { Props } from './types';

const Dialpad = buildContainer<Props>({
  View: DialpadView,
  ViewModel: DialpadViewModel,
});

export { Dialpad, Props };
