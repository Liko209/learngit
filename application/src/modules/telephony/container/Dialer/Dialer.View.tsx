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
import { CALL_STATE } from '../../FSM';
import { DialerKeypadHeader } from '../DialerKeypadHeader';

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
    const { callState } = this.props;
    return (
      <JuiDialer>
        {callState === CALL_STATE.INCOMING && <Incoming />}
        {
          callState !== CALL_STATE.INCOMING && (
            <>
              <JuiHeaderContainer>
                <DialerTitleBar />
                {
                  this.props.keypadEntered ?
                    <DialerKeypadHeader />
                    :
                    <DialerHeader />
                }
              </JuiHeaderContainer>
              <DialerContainer />
            </>
          )
        }
      </JuiDialer >
    );
  }
}

const DialerView = withDialogOrNewWindow(DialerViewComponent);

export { DialerView };
