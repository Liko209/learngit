/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

// import GroupModel from '@/store/models/Group';
import { JuiAvatarProps } from 'jui/components/Avatar';

type GroupAvatarProps = JuiAvatarProps & {
  cid: number;
};

type GroupAvatarViewProps = JuiAvatarProps & {
  src: string;
};

export { GroupAvatarProps, GroupAvatarViewProps };
