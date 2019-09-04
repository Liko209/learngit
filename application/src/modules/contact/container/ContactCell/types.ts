/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-26 19:07:45
 * Copyright © RingCentral. All rights reserved.
 */
import { CellProps } from '@/modules/common/container/Layout';
import { ContactType } from '../types';
import { NavType } from '../ContactTab/types';

type ContactCellProps = CellProps & {
  type: NavType;
};

type ContactCellViewProps = ContactCellProps & {
  displayName: string;
  isGuest: boolean;
  phoneNumber: string;
};

export { ContactCellProps, ContactCellViewProps, ContactType };
