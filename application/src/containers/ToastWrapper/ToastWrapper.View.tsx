/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-06 14:42:05
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { JuiToastWrapper } from 'jui/pattern/ToastWrapper';
import { observer } from 'mobx-react';
import { ToastWrapperViewProps } from './types';
import { Toast } from './Toast';

@observer
class ToastWrapperView extends React.Component<ToastWrapperViewProps> {
  renderToasts() {
    return this.props.toasts.map(toast => <Toast key={toast.id} {...toast} />);
  }
  render() {
    let paddingTop;
    const mainSection = document.querySelector('#app-main-section');
    if (mainSection) {
      paddingTop = (mainSection as HTMLElement).offsetTop;
    }
    return this.props.toasts.length ? (
      <JuiToastWrapper paddingTop={paddingTop} {...this.props}>
        {this.renderToasts()}
      </JuiToastWrapper>
    ) : null;
  }
}

export { ToastWrapperView };
