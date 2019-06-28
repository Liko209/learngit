/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-24 09:44:44
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { InputFooterView } from './InputFooter.View';
import { InputFooterViewModel } from './InputFooter.ViewModel';
import { InputFooterProps } from './types';

const InputFooter = buildContainer<InputFooterProps>({
  View: InputFooterView,
  ViewModel: InputFooterViewModel,
});

export { InputFooter };
