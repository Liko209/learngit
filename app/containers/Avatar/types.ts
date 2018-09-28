/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiAvatar, TJuiAvatarProps } from 'ui-components/atoms/Avatar';

type AvatarProps = TJuiAvatarProps & {
  uid: number;
};
type AvatarViewProps = {
  name?: string;
  url?: string;
  bgColor?: string;
};
export { AvatarProps, AvatarViewProps };
