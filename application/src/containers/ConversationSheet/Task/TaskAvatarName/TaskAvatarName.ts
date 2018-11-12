/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 17:27:47
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { TaskAvatarNameView } from './TaskAvatarName.View';
import { TaskAvatarNameViewModel } from './TaskAvatarName.ViewModel';
import { Props } from './types';

const TaskAvatarName = buildContainer<Props>({
  View: TaskAvatarNameView,
  ViewModel: TaskAvatarNameViewModel,
});

export { TaskAvatarName, Props };
