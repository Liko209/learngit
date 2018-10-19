/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 14:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

enum OPERATION {
  BACK,
  FORWARD,
}

type IconsProps = {
  type: OPERATION;
  disabled: boolean;
  tooltipTitle: string;
  onClick: ((event: React.MouseEvent<HTMLSpanElement>) => void);
  onLongPress: ((target: EventTarget & HTMLElement) => void);
};

export { IconsProps, OPERATION };
