/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 09:59:00
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedItem } from '../../base/entity';

export type SanitizedTaskItem = SanitizedItem & {
  due: number;
  assigned_to_ids: number[];
  color: string;
};
