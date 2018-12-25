/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ActionsView } from './Actions.View';
import { ActionsViewModel } from './Actions.ViewModel';
import { ActionsProps } from './types';

const Actions = buildContainer<
  ActionsProps & {
    onFocus: (value: boolean) => void;
    onBlur: (value: boolean) => void;
  }
>({
  View: ActionsView,
  ViewModel: ActionsViewModel,
});

export { Actions };
