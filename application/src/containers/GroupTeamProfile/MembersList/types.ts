/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { WithNamespaces } from 'react-i18next';
import { ProfileType } from '../types';

type MemberListViewProps = WithNamespaces & {
  memberIds: number[];
  gid: number;
};
type MemberListProps = {
  id: number;
  type: ProfileType;
};
export { MemberListViewProps, MemberListProps };
