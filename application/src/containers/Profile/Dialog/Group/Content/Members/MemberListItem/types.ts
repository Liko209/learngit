/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:38:02
 * Copyright © RingCentral. All rights reserved.
 */
import PersonModel from '@/store/models/Person';

type MemberListItemProps = {
  cid: number; // conversation id
  pid: number; // person id
};

type MembersViewProps = MemberListItemProps & {
  person: PersonModel;
  isThePersonGuest: boolean;
  isThePersonAdmin: boolean;
  isCurrentUserAdmin: boolean;
  currentUserId: number;
  adminNumber: number;
  isTeam: boolean;
};

export { MembersViewProps, MemberListItemProps };
