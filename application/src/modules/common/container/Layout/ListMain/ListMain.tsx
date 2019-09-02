/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 16:20:33
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';

import { ListMainView } from './ListMain.View';
import { ListMainViewModel } from './ListMain.ViewModel';
import { ListMainProps } from './types';

const ListMain = buildContainer<ListMainProps>({
  View: ListMainView,
  ViewModel: ListMainViewModel,
});

export { ListMain };
