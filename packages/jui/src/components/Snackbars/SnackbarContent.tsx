/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-16 10:08:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import * as Jui from './style';
import { Palette } from '../../foundation/theme/theme';

type JuiSnackbarsType = 'warn' | 'success' | 'error' | 'info';

type SnackbarContentColor = [keyof Palette, string];

type IconAndColor = {
  icon: string;
  color: SnackbarContentColor;
};

type JuiSnackbarsProps = {
  open?: boolean;
  type: JuiSnackbarsType;
  children: React.ReactNode;
};

type IconAndColorMap = {
  [key: string]: IconAndColor;
};

function getIconAndColor(type: JuiSnackbarsType): IconAndColor {
  const ICON_AND_COLOR: IconAndColorMap = {
    warn: {
      icon: 'warning',
      color: ['semantic', 'critical'],
    },
    success: {
      icon: 'check_circle',
      color: ['semantic', 'positive'],
    },
    error: {
      icon: 'error',
      color: ['semantic', 'negative'],
    },
    info: {
      icon: 'info',
      color: ['primary', 'main'],
    },
  };
  return ICON_AND_COLOR[type];
}

const JuiSnackbarContent: React.SFC<JuiSnackbarsProps> = (
  props: JuiSnackbarsProps,
) => {
  const { children, type, ...rest } = props;
  const { icon, color } = getIconAndColor(type);
  const message = (
    <Jui.MessageWrapper>
      {<Jui.SnackbarIcon color={color}>{icon}</Jui.SnackbarIcon>}
      {children}
    </Jui.MessageWrapper>
  );

  return (
    <Jui.SnackbarContent
      bgColor={color}
      classes={{
        message: 'message',
      }}
      message={message}
      {...rest}
    />
  );
};

export { JuiSnackbarContent, JuiSnackbarsProps, SnackbarContentColor };
