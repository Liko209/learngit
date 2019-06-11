/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-30 10:34:34
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ContactSearchListView } from './ContactSearchList.View';
import { ContactSearchListViewModel } from './ContactSearchList.ViewModel';
import { ContactSearchListProps } from './types';

const ContactSearchList = buildContainer<ContactSearchListProps>({
  View: ContactSearchListView,
  ViewModel: ContactSearchListViewModel,
});

export { ContactSearchList };
