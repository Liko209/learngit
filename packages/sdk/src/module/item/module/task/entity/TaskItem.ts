/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 09:59:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../../base/entity';

export type TaskItem = Item & {
  color: string;
  complete: boolean;
  notes: string;
  start: number;
  end: number;
  section: string;
  repeat: string;
  repeat_ending: string;
  repeat_ending_after: string;
  repeat_ending_on: number | null;
  text: string;
  due: number;
  complete_type: string;
  assigned_to_ids: number[];
  complete_people_ids: number[];
  attachment_ids: number[];
  complete_percentage: number;
  hasDueTime: boolean;
};
