/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-27 20:22:55
 * Copyright © RingCentral. All rights reserved.
 */
import { NavType } from '../ContactTab/types';
import { ContactType } from '../types';

type ActionsProps = {
  id: number;
  entity: NavType;
  phoneNumber: string;
  contactType: ContactType;
};

type ActionsViewProps = ActionsProps & {};

export { ActionsProps, ActionsViewProps, NavType, ContactType };
