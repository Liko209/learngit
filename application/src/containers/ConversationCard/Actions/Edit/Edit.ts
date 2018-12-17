/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { EditView } from './Edit.View';
import { EditViewModel } from './Edit.ViewModel';
import { EditProps } from './types';

const Edit = buildContainer<EditProps>({
  View: EditView,
  ViewModel: EditViewModel,
});

export { Edit };
