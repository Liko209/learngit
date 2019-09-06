/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import GroupModel from '@/store/models/Group';

type MemberHeaderProps = {
  id: number;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type MemberHeaderViewProps = {
  group: GroupModel;
  hasSearch: boolean;
  hasShadow: boolean;
  isCurrentUserHasPermissionAddMember: boolean;
};
export { MemberHeaderProps, MemberHeaderViewProps };
