/*
 * @Author: Paynter Chen
 * @Date: 2019-01-14 17:42:50
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedItem } from '../../base/entity';

export type SanitizedCodeItem = SanitizedItem & {
  title: string;
  mode: string;
  mime_type: string;
  wrap_lines: boolean;
};
