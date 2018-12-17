/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-09 10:10:02
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { DeleteView } from './Delete.View';
import { DeleteViewModel } from './Delete.ViewModel';
import { Props } from './types';

const Delete = buildContainer<Props>({
  View: DeleteView,
  ViewModel: DeleteViewModel,
});

export { Delete, Props };
