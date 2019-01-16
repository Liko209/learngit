/*
 * @Author: Paynter Chen
 * @Date: 2019-01-14 17:46:18
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../../base/entity';

export type CodeItem = Item & {
  body: string;
  mode: string;
  mime_type: string;
  wrap_lines: boolean;
};
