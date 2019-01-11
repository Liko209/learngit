/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:47:16
 * Copyright © RingCentral. All rights reserved.
 */
import EventItemModel from '@/store/models/EventItem';

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
  event: EventItemModel;
};

type EventUpdateViewProps = {
  activityData: ActivityData;
  event: EventItemModel;
  oldTimeText: string;
  newTimeText: string;
};

export { EventProps, EventViewProps, EventUpdateViewProps, EventUpdateProps };
