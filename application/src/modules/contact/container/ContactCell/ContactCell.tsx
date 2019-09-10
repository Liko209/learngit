/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 16:20:33
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';

import { ContactCellView } from './ContactCell.View';
import { ContactCellViewModel } from './ContactCell.ViewModel';
import { ContactCellProps } from './types';

const ContactCell = buildContainer<ContactCellProps>({
  View: ContactCellView,
  ViewModel: ContactCellViewModel,
});

export { ContactCell };
