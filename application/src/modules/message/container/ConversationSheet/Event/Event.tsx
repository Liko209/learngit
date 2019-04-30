/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 14:52:23
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { EventView } from './Event.View';
import { EventViewModel } from './Event.ViewModel';
import { EventProps } from './types';

const Event = buildContainer<EventProps>({
  ViewModel: EventViewModel,
  View: EventView,
});

export { Event, EventProps };
