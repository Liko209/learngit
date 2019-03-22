/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 09:59:00
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedItem } from '../../base/entity';

export type SanitizedEventItem = SanitizedItem & {
  start: number;
  end: number;
  effective_end: number;
  repeat: string;
  repeat_ending: string;
  repeat_ending_after: string;
  repeat_ending_on: number | null;
  all_day: boolean;
};
