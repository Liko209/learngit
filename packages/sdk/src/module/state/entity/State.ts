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
  __trigger_ids?: number[];
  last_group_id: number;
  at_mentioning_post_ids?: number[];
};
