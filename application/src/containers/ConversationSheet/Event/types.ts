/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:47:16
 * Copyright © RingCentral. All rights reserved.
 */
import { EventItem } from '@/store/models/Items';

type ActivityData = {
  [index: string]: any;
};

type EventProps = {
  ids: number[];
};

type EventUpdateProps = {
  postId: number;
} & EventProps;

type EventViewProps = {
  event: EventItem;
};

type EventUpdateViewProps = {
  activityData: ActivityData;
  event: EventItem;
};

export { EventProps, EventViewProps, EventUpdateViewProps, EventUpdateProps };
