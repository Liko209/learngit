/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-07-22 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { MouseEventHandler } from 'react';

type JuiIconLinkProps = {
  disabled?: boolean;
  iconName?: string;
  onClick?: MouseEventHandler<any>;
  children: string;
};

export { JuiIconLinkProps };
