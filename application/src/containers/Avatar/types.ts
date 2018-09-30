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
  name?: string;
  url?: string;
  bgColor?: string;
};
export { AvatarProps, AvatarViewProps };
