/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-22 15:22:09
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import * as Jui from './style';
import { Palette } from '../../foundation/theme/theme';
import { SnackbarContentProps as MuiSnackbarContentProps } from '@material-ui/core/SnackbarContent';

type JuiSnackbarsType = 'warn' | 'success' | 'error' | 'info';
type SnackbarContentColor = [keyof Palette, string];
type MessageAlignment = 'left' | 'center';
type ColorType = {
  color: SnackbarContentColor;
};
type ColorMap = {
  [key: string]: ColorType;
};

type JuiSnackbarContentProps = MuiSnackbarContentProps & {
  type: JuiSnackbarsType;
  messageAlign: MessageAlignment;
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
    color: ['grey', '700'],
  },
};

function getColor(type: JuiSnackbarsType, map: ColorMap): ColorType {
  return map[type];
}
class JuiSnackbarContent extends React.PureComponent<JuiSnackbarContentProps> {
  static defaultProps = {
    radius: 0,
    messageAlign: 'left',
    fullWidth: false,
  };

  render() {
    const { type, ...rest } = this.props;
    const result = getColor(type, COLOR_MAP);
    const color = result.color;
    return (
      <Jui.SnackbarContent
        classes={{
          message: 'message',
          action: 'action',
        }}
        bgColor={color}
        {...rest}
      />
    );
  }
}

export {
  JuiSnackbarContent,
  JuiSnackbarContentProps,
  MessageAlignment,
  SnackbarContentColor,
  JuiSnackbarsType,
};
