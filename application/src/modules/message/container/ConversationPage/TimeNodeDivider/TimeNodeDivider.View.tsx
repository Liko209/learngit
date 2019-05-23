/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { TimeNodeDividerViewProps } from './types';
import { JuiTimeNodeDivider } from 'jui/pattern/ConversationPage/TimeNodeDivider';

@observer
class TimeNodeDividerView extends Component<TimeNodeDividerViewProps> {
  render() {
    const { text } = this.props;
    return <JuiTimeNodeDivider text={text.get()} />;
  }
}

export { TimeNodeDividerView };
