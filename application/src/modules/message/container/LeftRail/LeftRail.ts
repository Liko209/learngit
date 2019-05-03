/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 15:04:30
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { LeftRailView } from './LeftRail.View';
import { LeftRailViewModel } from './LeftRail.ViewModel';
import { LeftRailProps } from './types';

const LeftRail = buildContainer<LeftRailProps>({
  ViewModel: LeftRailViewModel,
  View: LeftRailView,
});

export { LeftRail, LeftRailProps };
