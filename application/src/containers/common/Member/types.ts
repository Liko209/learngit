/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-11 16:25:35,
 * Copyright © RingCentral. All rights reserved.
 */
type MemberProps = {
  id: number;
};

type MemberViewProps = {
  groupId: number;
  membersCount: number;
  showMembersCount: boolean;
};

export { MemberProps, MemberViewProps };
