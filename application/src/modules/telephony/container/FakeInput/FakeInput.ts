/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-09 13:46:59
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { FakeInputView } from './FakeInput.View';
import { FakeInputViewModel } from './FakeInput.ViewModel';
import { FakeInputProps } from './types';

const FakeInput = buildContainer<FakeInputProps>({
  View: FakeInputView,
  ViewModel: FakeInputViewModel,
});

export { FakeInput };
