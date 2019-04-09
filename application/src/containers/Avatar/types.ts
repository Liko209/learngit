/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiAvatarProps } from 'jui/components/Avatar';

type AvatarProps = JuiAvatarProps & {
  uid?: number;
  showDefaultAvatar?: boolean;
  automationId?: string;
};

type AvatarViewProps = JuiAvatarProps & {
  shortName?: string;
  headShotUrl?: string;
  bgColor?: string;
  shouldShowShortName?: boolean;
  automationId?: string;
  showDefaultAvatar?: boolean;
};
export { AvatarProps, AvatarViewProps };
