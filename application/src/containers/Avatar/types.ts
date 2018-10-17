/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiAvatarProps } from 'jui/components/Avatar';

type AvatarProps = JuiAvatarProps & {
  uid: number;
};

type AvatarViewProps = JuiAvatarProps & {
  shortName?: string;
  headShotUrl?: string;
  bgColor?: string;
  shouldShowShortName?: string;
};
export { AvatarProps, AvatarViewProps };
