/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React, { createRef, RefObject } from 'react';
import { observer } from 'mobx-react';
import { JuiDialer, JuiHeaderContainer } from 'jui/pattern/Dialer';
// import ReactDOM from 'react-dom';
import { DialerTitleBar } from '../DialerTitleBar';
import { DialerHeader } from '../DialerHeader';
import { DialerContainer } from '../DialerContainer';
import { DialerViewProps } from './types';
import { withDialogOrNewWindow } from '../../HOC';
import { Incoming } from '../Incoming';
import { DialerKeypadHeader } from '../DialerKeypadHeader';
@observer
class DialerViewComponent extends React.Component<DialerViewProps> {
  dialerHeaderRef: RefObject<any> = createRef();

  renderDialer = () => {
    const { hasIncomingCall, keypadEntered } = this.props;
    if (hasIncomingCall) return <Incoming />;

    return (
      <>
        <JuiHeaderContainer>
          <DialerTitleBar />
          {keypadEntered ? (
            <DialerKeypadHeader />
          ) : (
            <DialerHeader ref={this.dialerHeaderRef} />
          )}
        </JuiHeaderContainer>
        <DialerContainer dialerHeaderRef={this.dialerHeaderRef} />
      </>
    );
  }

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
