/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:47:16
 * Copyright © RingCentral. All rights reserved.
 */
import EventItemModal from '@/store/models/EventItem';

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
  event: EventItemModal;
};

type EventUpdateViewProps = {
  activityData: ActivityData;
  event: EventItemModal;
};

export { EventProps, EventViewProps, EventUpdateViewProps, EventUpdateProps };
