/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { TimeNodeDividerViewProps } from './types';
import { JuiTimeNodeDivider } from 'jui/pattern/ConversationPage/TimeNodeDivider';

class TimeNodeDividerView extends Component<TimeNodeDividerViewProps> {
  render() {
    const { text } = this.props;
    return <JuiTimeNodeDivider text={text} />;
  }
}

export { TimeNodeDividerView };
