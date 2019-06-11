/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ReadView } from './Read.View';
import { ReadViewModel } from './Read.ViewModel';
import { ReadProps } from './types';

const Read = buildContainer<ReadProps>({
  View: ReadView,
  ViewModel: ReadViewModel,
});

export { Read };
