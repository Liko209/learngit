/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { OpenProfileDialogView } from './OpenProfileDialog.View';
import { OpenProfileDialogViewModel } from './OpenProfileDialog.ViewModel';
import { OpenProfileDialogProps } from './types';

const OpenProfileDialog = buildContainer<OpenProfileDialogProps>({
  View: OpenProfileDialogView,
  ViewModel: OpenProfileDialogViewModel,
});

export { OpenProfileDialog };
