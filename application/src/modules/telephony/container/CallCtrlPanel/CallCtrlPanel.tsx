/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-25 17:11:36
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { CallCtrlPanelView } from './CallCtrlPanel.View';
import { CallCtrlPanelViewModel } from './CallCtrlPanel.ViewModel';
import { CallCtrlPanelProps } from './types';

const CallCtrlPanel = buildContainer<CallCtrlPanelProps>({
  View: CallCtrlPanelView,
  ViewModel: CallCtrlPanelViewModel,
});

export { CallCtrlPanel };
