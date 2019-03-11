/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiHeader } from 'jui/pattern/Dialer';
import { DialerHeaderViewProps } from './types';
import { Avatar } from '@/containers/Avatar';

@observer
class DialerHeaderView extends React.Component<DialerHeaderViewProps> {
  private _Avatar = () => {
    const { uid } = this.props;
    return <Avatar uid={uid} size="large" />;
  }

  render() {
    const { name, phone } = this.props;
    return <JuiHeader Avatar={this._Avatar} name={name} phone={phone} />;
  }
}

export { DialerHeaderView };
