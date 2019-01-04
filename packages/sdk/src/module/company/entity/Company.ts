import { ExtendedBaseModel } from '../../models';

/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 14:42:00
 * Copyright © RingCentral. All rights reserved.
 */

export type Company = ExtendedBaseModel & {
  name: string;
  domain: string | string[];
  admins: number[];
  custom_emoji: { [index: string]: { data: string } };
  _delta?: { add_keys?: object; remove_keys: object };
  rc_account_id?: number;
  webmail_person_id?: number;
};
