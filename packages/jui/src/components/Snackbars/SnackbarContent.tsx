/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-22 15:22:09
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import * as Jui from './style';
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
  type: JuiSnackbarsType;
  message: React.ReactNode;
  messageAlign: MessageAlignment;
  actions?: React.ReactNode[];
  radius: number;
  fullWidth: boolean;
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
class JuiSnackbarContent extends React.PureComponent<JuiSnackbarsProps> {
  static defaultProps = {
    radius: 0,
    messageAlign: 'left',
    fullWidth: false,
  };

  render() {
    const { message, type, actions, ...rest } = this.props;
    const result = getColor(type, COLOR_MAP);
    const color = result.color;
    return (
      <Jui.SnackbarContent
        classes={{
          message: 'message',
        }}
        bgColor={color}
        action={actions}
        message={message}
        {...rest}
      />
    );
  }
}

export {
  JuiSnackbarContent,
  JuiSnackbarsProps,
  MessageAlignment,
  SnackbarContentColor,
  JuiSnackbarsType,
};
