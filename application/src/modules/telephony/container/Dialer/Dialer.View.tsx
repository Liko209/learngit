/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiDialer } from 'jui/pattern/Dialer';
import { DialerTitleBar } from '../DialerTitleBar';
import { DialerHeader } from '../DialerHeader';
import { DialerContainer } from '../DialerContainer';
import { withDialogOrNewWindow } from '../../HOC';
@observer
class DialerViewComponent extends React.Component {
  render() {
    return (
      <JuiDialer>
        <DialerTitleBar />
        <DialerHeader phoneNumber="(650) 555-12345" />
        <DialerContainer />
      </JuiDialer>
    );
  }
}

const DialerView = withDialogOrNewWindow(DialerViewComponent);

export { DialerView };
