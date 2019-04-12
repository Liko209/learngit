/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { AnswerView } from './Answer.View';
import { AnswerViewModel } from './Answer.ViewModel';
import { AnswerProps } from './types';

const Answer = buildContainer<AnswerProps>({
  View: AnswerView,
  ViewModel: AnswerViewModel,
});

export { Answer };
