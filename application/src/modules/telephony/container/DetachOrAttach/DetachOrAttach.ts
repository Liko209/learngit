/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { DetachOrAttachView } from './DetachOrAttach.View';
import { DetachOrAttachViewModel } from './DetachOrAttach.ViewModel';
import { DetachOrAttachProps } from './types';

const DetachOrAttach = buildContainer<DetachOrAttachProps>({
  View: DetachOrAttachView,
  ViewModel: DetachOrAttachViewModel,
});

export { DetachOrAttach };
