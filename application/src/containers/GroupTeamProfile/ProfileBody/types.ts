/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ProfileType } from '../types';

type ProfileHeaderViewProps = {
  id: number;
  name: string;
  description?: string;
  type: ProfileType;
  dismiss: () => void;
  isShowMessageButton: boolean;
  awayStatus?: string;
  jobTitle?: string;
  isCurrentUser?: string;
  isGroupOrTeam?: boolean;
  isPerson?: boolean;
  isGroup?: boolean;
};

type ProfileBodyProps = {
  id: number;
  dismiss: () => void;
  type: ProfileType;
  isGroupOrTeam?: boolean;
};

export { ProfileHeaderViewProps, ProfileBodyProps };
