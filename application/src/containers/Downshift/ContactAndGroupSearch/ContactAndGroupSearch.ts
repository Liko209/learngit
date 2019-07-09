/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-07-09 14:07:14
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
