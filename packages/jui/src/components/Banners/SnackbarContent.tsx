/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-16 10:08:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import * as Jui from './style';
import { Palette } from '../../foundation/theme/theme';
import info from '../../assets/jupiter-icon/icon-info.svg';
import { SvgSymbol } from '../../foundation/Iconography';

type JuiSnackbarsType = 'warn' | 'success' | 'error' | 'info';

type SnackbarContentColor = [keyof Palette, string];

type IconAndColor = {
  icon: SvgSymbol;
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

// MTODO: ask design for icon
function getIconAndColor(type: JuiSnackbarsType): IconAndColor {
  const ICON_AND_COLOR: IconAndColorMap = {
    warn: {
      icon: info,
      color: ['semantic', 'critical'],
    },
    success: {
      icon: info,
      color: ['semantic', 'positive'],
    },
    error: {
      icon: info,
      color: ['semantic', 'negative'],
    },
    info: {
      icon: info,
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
      {<Jui.SnackbarIcon color={color} icon={icon} />}
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
