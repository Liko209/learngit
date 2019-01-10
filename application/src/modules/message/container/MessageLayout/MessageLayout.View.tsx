/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-11 00:26:12
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { JuiResponsiveLayout } from 'jui/foundation/Layout/Response/ResponsiveLayout';
import { MessageLayoutViewProps } from './types';

class MessageLayoutView extends Component<MessageLayoutViewProps> {
  render() {
    const { isLeftNavOpen, children } = this.props;
    const leftNavWidth = isLeftNavOpen ? 200 : 72;
    return (
      <JuiResponsiveLayout
        tag="conversation"
        leftNavWidth={leftNavWidth}
        mainPanelIndex={1}
      >
        {children}
      </JuiResponsiveLayout>
    );
  }
}
export { MessageLayoutView };
