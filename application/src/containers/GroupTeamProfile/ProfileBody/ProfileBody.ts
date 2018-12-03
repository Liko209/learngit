/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { ProfileBodyView } from './ProfileBody.View';
import { ProfilePersonBodyViewModel } from './ProfilePersonBody.ViewModel';
import { ProfileBodyProps } from './types';

const ProfileBody = buildContainer<ProfileBodyProps>({
  View: ProfileBodyView,
  ViewModel: ProfilePersonBodyViewModel,
});

export { ProfileBody };
