/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { RecordView } from './Record.View';
import { RecordViewModel } from './Record.ViewModel';
import { RecordProps } from './types';

const Record = buildContainer<RecordProps>({
  View: RecordView,
  ViewModel: RecordViewModel,
});

export { Record };
