/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-29 16:16:10
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { DialBtnView } from './DialBtn.View';
import { DialBtnViewModel } from './DialBtn.ViewModel';
import { DialBtnProps } from './types';

const DialBtn = buildContainer<DialBtnProps>({
  View: DialBtnView,
  ViewModel: DialBtnViewModel,
});

export { DialBtn };
