/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-16 10:08:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import * as Jui from './style';
import { JuiIconography } from '../../foundation/Iconography';

type JuiSnackbarsType = 'warn' | 'success' | 'error' | 'info';

type JuiSnackbarsProps = {
  open?: boolean;
  type: JuiSnackbarsType;
};

const SnackBarsIcon: React.SFC<{ type: JuiSnackbarsType }> = ({ type }) => {
  let iconName;
  switch (type) {
    case 'warn':
      iconName = 'warning';
    case 'success':
      iconName = 'check_circle';
    case 'error':
      iconName = 'error';
    case 'info':
      iconName = 'info';
  }
  return <JuiIconography>{iconName}</JuiIconography>;
};

class JuiSnackbarContent extends React.Component<JuiSnackbarsProps> {
  render() {
    const { children, open, type } = this.props;
    const isOpen: boolean = typeof open === 'undefined' ? true : false;
    console.log(open);
    console.log(isOpen);
    console.log(children);
    const message = (
      <Jui.MessageWrapper>
        {<SnackBarsIcon type={type} />}
        {children}
      </Jui.MessageWrapper>
    );
    return (
      <Jui.SnackbarContent
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
