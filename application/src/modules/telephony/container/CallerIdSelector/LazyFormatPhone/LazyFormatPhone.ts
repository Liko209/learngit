/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 13:15:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { LazyFormatPhoneView } from './LazyFormatPhone.View';
import { LazyFormatPhoneViewModel } from './LazyFormatPhone.ViewModel';
import { LazyFormatPhoneProps } from './types';

const LazyFormatPhone = buildContainer<LazyFormatPhoneProps>({
  View: LazyFormatPhoneView,
  ViewModel: LazyFormatPhoneViewModel,
});

export { LazyFormatPhone };
