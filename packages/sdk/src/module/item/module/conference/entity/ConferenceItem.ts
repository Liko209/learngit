/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-14 23:09:23
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../../base/entity';

export type RC_Conference_Data = {
  hostCode: string;
  participantCode: string;
  phoneNumber: string;
};

export type ConferenceItem = Item & {
  rc_data: RC_Conference_Data;
};
