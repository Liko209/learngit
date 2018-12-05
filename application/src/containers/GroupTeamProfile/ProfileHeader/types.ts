/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { DismissProps, ProfileType } from '../types';

type ProfileHeaderViewProps = {
  title?: string;
  id: number;
  type: ProfileType;
  isTeam: boolean;
} & DismissProps;
type ProfileHeaderProps = DismissProps & {
  title?: string;
  id: number;
  type: ProfileType;
};
export { ProfileHeaderViewProps, ProfileHeaderProps };
