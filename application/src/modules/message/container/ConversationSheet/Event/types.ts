/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:47:16
 * Copyright © RingCentral. All rights reserved.
 */
import { PromisedComputedValue } from 'computed-async-mobx';
import EventItemModel from '@/store/models/EventItem';
import { Palette } from 'jui/foundation/theme/theme';

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
  color?: [keyof Palette, string];
};

type EventUpdateViewProps = {
  activityData: ActivityData;
  event: EventItemModel;
  oldTimeText: PromisedComputedValue<string>;
  newTimeText: PromisedComputedValue<string>;
  color?: [keyof Palette, string];
};

export { EventProps, EventViewProps, EventUpdateViewProps, EventUpdateProps };
