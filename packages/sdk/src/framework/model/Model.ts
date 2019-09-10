/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 09:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { DatabaseKeyType } from 'foundation/db';

export type ModelIdType = DatabaseKeyType;

export type IdModel<IdType extends DatabaseKeyType = number> = {
  id: IdType;
  _id?: IdType;
  isMocked?: boolean;
};
