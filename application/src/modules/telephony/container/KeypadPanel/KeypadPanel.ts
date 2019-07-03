/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-25 16:27:52
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { KeypadPanelView } from './KeypadPanel.View';
import { KeypadPanelViewModel } from './KeypadPanel.ViewModel';
import { KeypadPanelProps } from './types';

const KeypadPanel = buildContainer<KeypadPanelProps>({
  View: KeypadPanelView,
  ViewModel: KeypadPanelViewModel,
});

export { KeypadPanel };
