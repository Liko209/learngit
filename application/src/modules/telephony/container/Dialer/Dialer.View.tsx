/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiDialer, JuiHeaderContainer } from 'jui/pattern/Dialer';
import { DialerTitleBar } from '../DialerTitleBar';
import { DialerHeader } from '../DialerHeader';
import { DialerContainer } from '../DialerContainer';
import { DialerViewProps } from './types';
import { withDialogOrNewWindow } from '../../HOC';
import { Incoming } from '../Incoming';
import { Reply } from '../Reply';
import { CALL_STATE } from '../../FSM';
import { DialerKeypadHeader } from '../DialerKeypadHeader';
import { INCOMING_STATE } from '../../store';

@observer
class DialerViewComponent extends React.Component<DialerViewProps> {
  shouldComponentUpdate(nextProps: DialerViewProps) {
    const { callState } = nextProps;
    if (callState === CALL_STATE.IDLE) {
      return false;
    }
    return true;
  }
  render() {
    const { callState, incomingState } = this.props;
    return (
      <JuiDialer>
        {callState === CALL_STATE.INCOMING &&
          (incomingState === INCOMING_STATE.REPLY ? <Reply /> : <Incoming />)}
        {callState !== CALL_STATE.INCOMING && (
          <>
            <JuiHeaderContainer>
              <DialerTitleBar />
              {this.props.keypadEntered ? (
                <DialerKeypadHeader />
              ) : (
                <DialerHeader />
              )}
            </JuiHeaderContainer>
            <DialerContainer />
          </>
        )}
      </JuiDialer>
    );
  }
}

const DialerView = withDialogOrNewWindow(DialerViewComponent);

export { DialerView };
