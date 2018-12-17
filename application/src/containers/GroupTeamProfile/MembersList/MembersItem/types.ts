/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:38:02
 * Copyright © RingCentral. All rights reserved.
 */
import PersonModel from '@/store/models/Person';

type MembersViewProps = {
  uid: number;
  member: PersonModel;
  isThePersonGuest: boolean;
  isThePersonAdmin: boolean;
};
type MembersItemProps = {
  gid: number;
  uid: number;
};

export { MembersViewProps, MembersItemProps };
