/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-20 15:31:23
 * Copyright © RingCentral. All rights reserved.
 */

import { IconButtonSize } from 'jui/components/Buttons';

type MuteProps = {
  groupId: number;
  size?: IconButtonSize;
};

type MuteViewProps = {
  isMuted: boolean;
};

export { MuteProps, MuteViewProps };
