/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { IconButtonSize } from 'jui/components/Buttons';

type MoreProps = {
  id: number;
  size?: IconButtonSize;
  automationId?: string;
};

type MoreViewProps = MoreProps & {
  url: string;
  email: string;
};

export { MoreProps, MoreViewProps };
