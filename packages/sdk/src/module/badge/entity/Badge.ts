/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-24 16:53:14
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from 'sdk/framework/model';

type Badge = IdModel<string> & {
  unreadCount: number;
  mentionCount?: number;
};

export { Badge };
