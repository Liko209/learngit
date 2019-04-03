/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 09:57:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../../../../framework/model';

type SanitizedItem = IdModel & {
  group_ids: number[];
  created_at: number;
  modified_at: number;
};

export { SanitizedItem };
