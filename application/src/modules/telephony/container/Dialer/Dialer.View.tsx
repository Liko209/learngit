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
import { CALL_STATE } from '../../FSM';
import { DialerKeypadHeader } from '../DialerKeypadHeader';
import { Reply } from '../Reply';
import { INCOMING_STATE } from '../../store';

@observer
class DialerViewComponent extends React.Component<DialerViewProps> {
  dialerHeaderRef: RefObject<any> = createRef();

  render() {
    const {
      callState,
      keypadEntered,
      incomingState,
      dialerId,
      ...rest
    } = this.props;
    return (
      <JuiDialer {...rest} id={dialerId}>
        {callState === CALL_STATE.INCOMING &&
          (incomingState === INCOMING_STATE.REPLY ? <Reply /> : <Incoming />)}
        {// Dialer view here
        callState !== CALL_STATE.INCOMING && (
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
        )}
      </JuiDialer>
    );
  }
}

const DialerView = withDialogOrNewWindow(DialerViewComponent);

export { DialerView };
