/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 09:59:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../../base/entity';

export type EventItem = Item & {
  color: string;
  description: string;
  start: number;
  end: number;
  location: string;
  repeat: string;
  repeat_ending: string;
  repeat_ending_after: string;
  repeat_ending_on: string;
  text: string;
};
