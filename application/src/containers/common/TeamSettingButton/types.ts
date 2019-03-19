/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-16 09:24:45
 * Copyright © RingCentral. All rights reserved.
 */

import { IconButtonSize } from 'jui/components/Buttons';
import GroupModel from '@/store/models/Group';

type TeamSettingButtonProps = {
  id: number; // teamId
  size?: IconButtonSize;
};

type TeamSettingButtonViewProps = TeamSettingButtonProps & {
  group: GroupModel;
};

export { TeamSettingButtonProps, TeamSettingButtonViewProps };
