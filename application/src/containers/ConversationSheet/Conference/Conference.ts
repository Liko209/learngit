/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-15 13:33:50
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ConferenceView } from './Conference.View';
import { ConferenceViewModel } from './Conference.ViewModel';
import { Props } from './types';

const Conference = buildContainer<Props>({
  View: ConferenceView,
  ViewModel: ConferenceViewModel,
});

export { Conference, Props };
