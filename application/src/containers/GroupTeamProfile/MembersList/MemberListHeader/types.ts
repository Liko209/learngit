/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { ProfileType } from '../../types';

type MemberListHeaderViewProps = {
  counts: number;
  type: ProfileType;
  isShowHeaderShadow: boolean;
};
type MemberListHeaderProps = {
  id: number;
  type: ProfileType;
};
export { MemberListHeaderViewProps, MemberListHeaderProps };
