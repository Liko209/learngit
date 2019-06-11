/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-30 10:34:34
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ContactSearchItemView } from './ContactSearchItem.View';
import { ContactSearchItemViewModel } from './ContactSearchItem.ViewModel';
import { ContactSearchItemProps } from './types';

const ContactSearchItem = buildContainer<ContactSearchItemProps>({
  View: ContactSearchItemView,
  ViewModel: ContactSearchItemViewModel,
});

export { ContactSearchItem };
