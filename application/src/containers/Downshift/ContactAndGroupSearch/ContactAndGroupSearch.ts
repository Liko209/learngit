/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-18 13:46:56
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ContactAndGroupSearchView } from './ContactAndGroupSearch.View';
import { ContactAndGroupSearchViewModel } from './ContactAndGroupSearch.ViewModel';
import { ContactAndGroupSearchProps } from './types';

const ContactAndGroupSearch = buildContainer<ContactAndGroupSearchProps>({
  View: ContactAndGroupSearchView,
  ViewModel: ContactAndGroupSearchViewModel,
});

export { ContactAndGroupSearch };
