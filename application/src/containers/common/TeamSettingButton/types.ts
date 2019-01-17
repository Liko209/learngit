/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-16 09:24:45
 * Copyright © RingCentral. All rights reserved.
 */

import { IconButtonSize } from 'jui/components/Buttons';

type TeamSettingButtonProps = {
  id: number; // teamId
  size?: IconButtonSize;
};

type TeamSettingButtonViewProps = TeamSettingButtonProps;

export { TeamSettingButtonProps, TeamSettingButtonViewProps };
