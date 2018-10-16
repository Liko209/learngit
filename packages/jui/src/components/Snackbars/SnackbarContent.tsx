/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-16 10:08:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import * as Jui from './style';

type JuiSnackbarsType = 'warn' | 'success' | 'error' | 'info';

type JuiSnackbarsProps = {
  open?: boolean;
  type: JuiSnackbarsType;
};

const iconAndColorType = {
  warn: {
    icon: 'warning',
    color: ['semantic', 'critical'],
  },
  success: {
    icon: 'check_circle',
    color: ['semantic', 'positive'],
  },
  error: {
    icon: 'warning',
    color: ['semantic', 'negative'],
  },
  info: {
    icon: 'info',
    color: ['primary', 'main'],
  },
};

class JuiSnackbarContent extends React.Component<JuiSnackbarsProps> {
  render() {
    const { children, type } = this.props;
    const { icon, color } = iconAndColorType[type];
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
          root: 'root',
          message: 'message',
        }}
        message={message}
      />
    );
  }
}

export { JuiSnackbarContent, JuiSnackbarsProps };
