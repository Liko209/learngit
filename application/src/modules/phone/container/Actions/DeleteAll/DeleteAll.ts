/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:28:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { DeleteAllView } from './DeleteAll.View';
import { DeleteAllViewModel } from './DeleteAll.ViewModel';
import { DeleteProps } from './types';

const DeleteAll = buildContainer<DeleteProps>({
  View: DeleteAllView,
  ViewModel: DeleteAllViewModel,
});

export { DeleteAll };
