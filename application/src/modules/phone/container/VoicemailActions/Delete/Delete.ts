/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:28:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { DeleteView } from './Delete.View';
import { DeleteViewModel } from './Delete.ViewModel';
import { DeleteProps } from './types';

const Delete = buildContainer<DeleteProps>({
  View: DeleteView,
  ViewModel: DeleteViewModel,
});

export { Delete };
