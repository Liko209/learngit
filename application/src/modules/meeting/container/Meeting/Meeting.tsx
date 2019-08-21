/*
 * @Author: cooper.ruan
 * @Date: 2019-07-29 10:42:06
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MeetingView } from './Meeting.View';
import { MeetingViewModel } from './Meeting.ViewModel';
import { MeetingProps } from './types';

const Meeting = buildContainer<MeetingProps>({
  View: MeetingView,
  ViewModel: MeetingViewModel,
});

export { Meeting };
