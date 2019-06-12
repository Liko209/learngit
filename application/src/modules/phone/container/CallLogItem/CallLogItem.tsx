/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 14:44:12
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { CallLogItemView } from './CallLogItem.View';
import { CallLogItemViewModel } from './CallLogItem.ViewModel';
import { CallLogItemProps } from './types';

const CallLogItem = buildContainer<CallLogItemProps>({
  View: CallLogItemView,
  ViewModel: CallLogItemViewModel,
});

export { CallLogItem };
