/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-25 16:27:52
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { DialerPanelView } from './DialerPanel.View';
import { DialerPanelViewModel } from './DialerPanel.ViewModel';
import { DialerPanelProps } from './types';

const DialerPanel = buildContainer<DialerPanelProps>({
  View: DialerPanelView,
  ViewModel: DialerPanelViewModel,
});

export { DialerPanel };
