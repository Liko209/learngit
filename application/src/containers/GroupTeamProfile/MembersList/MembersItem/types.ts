/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:38:02
 * Copyright © RingCentral. All rights reserved.
 */
import PersonModel from '@/store/models/Person';

type MembersViewProps = {
  pid: number;
  gid: number;
  member: PersonModel;
  isThePersonGuest: boolean;
  isThePersonAdmin: boolean;
};
type MembersItemProps = {
  gid: number;
  pid: number;
};

export { MembersViewProps, MembersItemProps };
