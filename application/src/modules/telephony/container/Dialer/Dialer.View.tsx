/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiDialer } from 'jui/pattern/Dialer';
// import ReactDOM from 'react-dom';
import { DialerViewProps } from './types';
import { withDialogOrNewWindow } from '../../HOC';
import { Incoming } from '../Incoming';
import { KeypadPanel } from '../KeypadPanel';
import { DialerPanel } from '../DialerPanel';
import { CallCtrlPanel } from '../CallCtrlPanel';

@observer
class DialerViewComponent extends React.Component<DialerViewProps> {
  renderDialer = () => {
    const {
      isIncomingCall,
      keypadEntered,
      shouldDisplayCallCtrl,
      shouldDisplayDialer,
    } = this.props;
    switch (true) {
      case isIncomingCall:
        return <Incoming />;
      case shouldDisplayDialer:
        return <DialerPanel />;
      case keypadEntered:
        return <KeypadPanel />;
      case shouldDisplayCallCtrl:
        return <CallCtrlPanel />;
      default:
        return null;
    }
  };

  render() {
    const { dialerId, ...rest } = this.props;
    return (
      <JuiDialer {...rest} id={dialerId} data-test-automation-id="dialer">
        {this.renderDialer()}
      </JuiDialer>
    );
  }
}

const DialerView = withDialogOrNewWindow(DialerViewComponent);

export { DialerView };
