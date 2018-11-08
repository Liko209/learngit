/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:47:16
 * Copyright © RingCentral. All rights reserved.
 */
import { EventItem } from '@/store/models/Items';

type EventProps = {
  ids: number[];
};

type EventViewProps = {
  ids: number[];
  event: EventItem;
};

export { EventProps, EventViewProps };
