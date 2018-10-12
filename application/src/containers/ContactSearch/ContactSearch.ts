/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-18 13:46:56
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ContactSearchView } from './ContactSearch.View';
import { ContactSearchViewModel } from './ContactSearch.ViewModel';
import { ContactSearchProps } from './types';

const ContactSearch = buildContainer<ContactSearchProps>({
  View: ContactSearchView,
  ViewModel: ContactSearchViewModel,
});

export { ContactSearch };
