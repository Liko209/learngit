/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 10:39:27
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { CallHistoryView } from './CallHistory.View';
import { CallHistoryViewModel } from './CallHistory.ViewModel';

const CallHistory = buildContainer({
  View: CallHistoryView,
  ViewModel: CallHistoryViewModel,
});

export { CallHistory };
