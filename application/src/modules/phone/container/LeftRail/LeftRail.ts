/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 10:16:01
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { LeftRailView } from './LeftRail.View';
import { LeftRailViewModel } from './LeftRail.ViewModel';
import { LeftRailProps } from './types';

const LeftRail = buildContainer<LeftRailProps>({
  View: LeftRailView,
  ViewModel: LeftRailViewModel,
});

export { LeftRail };
