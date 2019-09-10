/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-11 16:25:35,
 * Copyright © RingCentral. All rights reserved.
 */
import { IconButtonSize } from 'jui/components/Buttons';

type MemberProps = {
  id: number;
};

type MemberViewProps = {
  isTeam: boolean;
  groupId: number;
  membersCount: number;
  showMembersCount: boolean;
  size?: IconButtonSize;
};

export { MemberProps, MemberViewProps };
