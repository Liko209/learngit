/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-09 16:32:38
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { DialerKeypadHeaderView } from './DialerKeypadHeader.View';
import { DialerKeypadHeaderViewModel } from './DialerKeypadHeader.ViewModel';
import { DialerKeypadHeaderProps } from './types';

const DialerKeypadHeader = buildContainer<DialerKeypadHeaderProps>({
  View: DialerKeypadHeaderView,
  ViewModel: DialerKeypadHeaderViewModel,
});

export { DialerKeypadHeader };
