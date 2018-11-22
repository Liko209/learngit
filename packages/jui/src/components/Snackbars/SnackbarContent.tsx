/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-22 15:22:09
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import * as Jui from './Style';
import { Palette } from '../../foundation/theme/theme';

type JuiSnackbarsType = 'warn' | 'success' | 'error' | 'info';
type SnackbarContentColor = [keyof Palette, string];
type MessageAlignment = 'left' | 'center';
type ColorType = {
  color: SnackbarContentColor;
};
type ColorMap = {
  [key: string]: ColorType;
};

type JuiSnackbarsProps = {
  open?: boolean;
  type: JuiSnackbarsType;
  messageAlign?: MessageAlignment;
  children: React.ReactNode;
  actions?: [];
  radius?: number;
};

const COLOR_MAP: ColorMap = {
  warn: {
    color: ['semantic', 'critical'],
  },
  success: {
    color: ['semantic', 'positive'],
  },
  error: {
    color: ['semantic', 'negative'],
  },
  info: {
    color: ['primary', 'main'],
  },
};

function getColor(type: JuiSnackbarsType, map: ColorMap): ColorType {
  return map[type];
}

const JuiSnackbarContent: React.SFC<JuiSnackbarsProps> = (
  pros: JuiSnackbarsProps,
) => {
  const { children, type, ...rest } = pros;
  const { color } = getColor(type, COLOR_MAP);
  const radius = pros.radius ? pros.radius : 0;
  const messageAlign = pros.messageAlign ? pros.messageAlign : 'left';
  return (
    <Jui.SnackbarContent
      bgColor={color}
      radius={radius}
      messageAlign={messageAlign}
      {...rest}
    />
  );
};

export {
  JuiSnackbarContent,
  JuiSnackbarsProps,
  MessageAlignment,
  SnackbarContentColor,
};
