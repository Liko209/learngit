/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-01 11:14:03
 * Copyright © RingCentral. All rights reserved.
 */
import { Item } from '../../base/entity';

export type RCVideoMeetingItem = Item & {
  meeting_id: string;
  status: string;
  join_url: string;
  start_url: string;
  rcv_meeting_id: string;
  start?: number;
  start_time: number;
  end_time?: number;
  end?: number;
};
