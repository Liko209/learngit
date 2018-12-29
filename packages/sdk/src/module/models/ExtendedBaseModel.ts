/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 13:15:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../framework/model';

export type ExtendedBaseModel = IdModel & {
  created_at: number;
  modified_at: number;
  creator_id: number;
  is_new: boolean;
  deactivated: boolean;
  version: number;
  model_id?: string;
  model_size?: number;
};
