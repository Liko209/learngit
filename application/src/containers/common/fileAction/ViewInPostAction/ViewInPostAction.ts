/*
 * @Author: wayne.zhou
 * @Date: 2019-05-28 09:36:19
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ViewInPostActionView } from './ViewInPostAction.View';
import { ViewInPostActionViewModel } from './ViewInPostAction.ViewModel';
import { ViewInPostActionProps } from './types';

const ViewInPostAction = buildContainer<ViewInPostActionProps>({
  View: ViewInPostActionView,
  ViewModel: ViewInPostActionViewModel,
});

export { ViewInPostAction, ViewInPostActionProps };
