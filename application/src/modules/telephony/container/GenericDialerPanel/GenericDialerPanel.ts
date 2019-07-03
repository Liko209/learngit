/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-25 16:27:52
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { GenericDialerPanelView } from './GenericDialerPanel.View';
import { GenericDialerPanelViewModel } from './GenericDialerPanel.ViewModel';
import { GenericDialerPanelProps } from './types';

const GenericDialerPanel = buildContainer<GenericDialerPanelProps>({
  View: GenericDialerPanelView,
  ViewModel: GenericDialerPanelViewModel,
});

export { GenericDialerPanel };
