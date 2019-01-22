/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ProfileDialogGroupViewProps } from '../../../types';

type MemberHeaderProps = {
  id: number;
  AddTeamMembers: (e: React.MouseEvent<HTMLElement>) => void;
};

type MemberHeaderViewProps = ProfileDialogGroupViewProps & {
  hasShadow: boolean;
  isCurrentUserHasPermissionAddTeam: boolean;
};
export { MemberHeaderProps, MemberHeaderViewProps };
