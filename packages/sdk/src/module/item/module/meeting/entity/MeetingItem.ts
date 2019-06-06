/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-23 13:45:45
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../../base/entity';

export type MeetingItem = Item & {
  email: string;
  first_name: string;
  last_name: string;
  is_rc_video: boolean;
  join_url: string;
  schedule_duration: number;
  schedule_start_time: string;
  schedule_timezone: string;
  start_time: number;
  end_time: number;
  start_url: string;
  status: string;

  zoom_host_id: string;
  zoom_id: string;
  zoom_meeting_id: number;
  zoom_password: string;
  zoom_token: string;
  zoom_topic: string;
  zoom_type: string;
  zoom_uuid: string;
};
