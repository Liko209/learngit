/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 14:52:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ExtendedBaseModel } from '../../models';

export type State = ExtendedBaseModel & {
  person_id: number;
  current_group_id: number;
  away_status_history?: string[];
  current_plugin: string;
  last_group_id: number;
  at_mentioning_post_ids?: number[];
};

export type MyState = State;

export type GroupState = {
  id: number;
  unread_count?: number;
  unread_mentions_count?: number;
  read_through?: number;
  last_read_through?: number; // last post of the group
  marked_as_unread?: boolean;
  post_cursor?: number;
  unread_deactivated_count?: number;
  group_post_cursor?: number;
  group_post_drp_cursor?: number;
};

export type TransformedState = {
  groupStates: GroupState[];
  myState?: State;
  isSelf?: boolean;
  isFromIndexData?: boolean;
};
