/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:47:16
 * Copyright © RingCentral. All rights reserved.
 */
import { EventItem } from '@/store/models/Items';
import Post from '@/store/models/Post';

type EventProps = {
  ids: number[];
};

type EventUpdateProps = {
  postId: number;
} & EventProps;

type EventViewProps = {
  ids: number[];
  event: EventItem;
};

type EventUpdateViewProps = {
  post: Post;
  postId: number;
} & EventViewProps;

export { EventProps, EventViewProps, EventUpdateViewProps, EventUpdateProps };
