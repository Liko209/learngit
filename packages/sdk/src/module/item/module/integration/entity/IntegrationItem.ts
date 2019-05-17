/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-29 10:23:56
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../../base/entity';

export type IntegrationItem = Item & {
  activity: string;
  body: string;
  integration_id: number;
  integration_owner_id: number;
};
