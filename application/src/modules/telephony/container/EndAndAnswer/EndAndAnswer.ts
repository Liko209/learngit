/*
 * @Author: Spike.Yang
 * @Date: 2019-08-22 17:01:34
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { EndAndAnswerView } from './EndAndAnswer.View';
import { EndAndAnswerViewModel } from './EndAndAnswer.ViewModel';
import { EndAndAnswerProps } from './types';

const EndAndAnswer = buildContainer<EndAndAnswerProps>({
  View: EndAndAnswerView,
  ViewModel: EndAndAnswerViewModel,
});

export { EndAndAnswer };
