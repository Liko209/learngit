/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-05-23 09:29:52
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MeetingView } from './Meeting.View';
import { MeetingViewModel } from './Meeting.ViewModel';
import { Props } from './types';

const Meeting = buildContainer<Props>({
  View: MeetingView,
  ViewModel: MeetingViewModel,
});

export { Meeting, Props };
