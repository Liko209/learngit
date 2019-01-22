/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-15 15:03:48
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { AddMembersView } from './AddMembers.View';
import { AddMembersViewModel } from './AddMembers.ViewModel';
import { ViewModuleProps } from './types';

const AddMembers = buildContainer<ViewModuleProps>({
  View: AddMembersView,
  ViewModel: AddMembersViewModel,
});

export { AddMembers };
