/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { WithNamespaces } from 'react-i18next';
import PersonModel from '@/store/models/Person';
import { ID_TYPE } from '../types';

type MemberListViewProps = WithNamespaces & {
  membersList: PersonModel[];
  idType: ID_TYPE;
  isThePersonAdmin: boolean[];
  isThePersonGuest: boolean[];
  isShowBottomShadow: boolean;
};
type MemberListProps = {
  id: number;
};
export { MemberListViewProps, MemberListProps };
