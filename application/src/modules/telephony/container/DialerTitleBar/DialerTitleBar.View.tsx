/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiTitleBar } from 'jui/pattern/Dialer';
import { DialerTitleBarViewProps } from './types';
import { Minimize } from '../Minimize';
// import { DetachOrAttach } from '../DetachOrAttach';

const Actions = [Minimize];
@observer
class DialerTitleBarView extends React.Component<DialerTitleBarViewProps> {
  render() {
    const { timing } = this.props;
    return <JuiTitleBar Actions={Actions} label={timing} />;
  }
}

export { DialerTitleBarView };
