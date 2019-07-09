/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 14:04:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PRESENCE } from '../constant';
import { IdModel } from '../../../framework/model';

export type RawPresence = {
  personId: number;
  calculatedStatus?: PRESENCE;
};

export type Presence = IdModel & {
  presence: RawPresence['calculatedStatus'];
};
