/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-12 14:53:27
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { EventUpdateView } from './EventUpdate.View';
import { EventUpdateViewModel } from './EventUpdate.ViewModel';
import { EventUpdateProps } from './types';

const EventUpdate = buildContainer<EventUpdateProps>({
  ViewModel: EventUpdateViewModel,
  View: EventUpdateView,
});

export { EventUpdate, EventUpdateProps };
