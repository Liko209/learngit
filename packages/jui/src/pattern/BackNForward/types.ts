/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 14:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

type IconsProps = {
  types: string;
  forwardDisabled?: boolean;
  backDisabled?: boolean;
  onBackWard?: ((event: React.MouseEvent<HTMLSpanElement>) => void);
  onForWard?: ((event: React.MouseEvent<HTMLSpanElement>) => void);
  onButtonPress: ((nav: string, event: React.TouchEvent | React.MouseEvent<HTMLElement>) => void);
  onButtonRelease: ((event: React.TouchEvent | React.MouseEvent<HTMLElement>) => void);
};

export { IconsProps };
