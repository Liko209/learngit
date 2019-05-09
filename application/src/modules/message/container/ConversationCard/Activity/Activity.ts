/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 10:25:11
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { ActivityView } from './Activity.View';
import { ActivityViewModel } from './Activity.ViewModel';

const Activity = buildContainer<{ id: number }>({
  View: ActivityView,
  ViewModel: ActivityViewModel,
});

export { Activity };
