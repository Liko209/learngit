/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 13:15:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { CallerIdItemView } from './CallerIdItem.View';
import { CallerIdItemViewModel } from './CallerIdItem.ViewModel';
import { CallerIdItemProps } from './types';

const CallerIdItem = buildContainer<CallerIdItemProps>({
  View: CallerIdItemView,
  ViewModel: CallerIdItemViewModel,
});

export { CallerIdItem };
