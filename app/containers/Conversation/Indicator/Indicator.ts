/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:07:02
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { IndicatorView } from './Indicator.View';
import { IndicatorViewModel } from './Indicator.ViewModel';
import { IndicatorProps } from './types';

const Indicator = buildContainer<IndicatorProps>({
  View: IndicatorView,
  ViewModel: IndicatorViewModel,
});

export { Indicator, IndicatorProps };
