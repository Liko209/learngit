/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-14 23:09:54
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedItem } from '../../base/entity';
import { RC_Conference_Data } from './ConferenceItem';

export type SanitizedConferenceItem = SanitizedItem & {
  rc_data: RC_Conference_Data;
};
