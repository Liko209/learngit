/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-16 15:01:30
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { EventItemView } from './EventItem.View';
import { EventItemViewModel } from './EventItem.ViewModel';
import { Props } from './types';

const EventItem = buildContainer<Props>({
  View: EventItemView,
  ViewModel: EventItemViewModel,
});

export { EventItem, Props };
