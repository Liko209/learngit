/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 09:59:00
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedItem } from '../../base/entity';

export type SanitizedFileItem = SanitizedItem & {
  name: string;
  type: string;
  __latest_post_id: number;
};
