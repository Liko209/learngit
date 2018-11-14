/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:11:30
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { JoinView } from './Join.View';
import { JoinViewModel } from './Join.ViewModel';
import { JoinProps } from './types';

const Join = buildContainer<JoinProps>({
  View: JoinView,
  ViewModel: JoinViewModel,
});

export { Join };
