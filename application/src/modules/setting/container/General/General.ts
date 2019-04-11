/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { GeneralView } from './General.View';
import { GeneralViewModel } from './General.ViewModel';
import { GeneralProps } from './types';

const General = buildContainer<GeneralProps>({
  View: GeneralView,
  ViewModel: GeneralViewModel,
});

export { General, GeneralProps };
