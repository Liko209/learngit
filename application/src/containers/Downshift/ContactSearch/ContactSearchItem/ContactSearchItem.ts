/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-04-08 17:33:36
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ContactSearchItemView } from './ContactSearchItem.View';
import { ContactSearchItemViewModel } from './ContactSearchItem.ViewModel';
import { Props } from './types';

const ContactSearchItem = buildContainer<Props>({
  View: ContactSearchItemView,
  ViewModel: ContactSearchItemViewModel,
});

export { ContactSearchItem };
