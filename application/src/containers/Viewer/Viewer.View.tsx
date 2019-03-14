/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ViewerViewProps, ViewerViewModelProps } from './types';
import { ViewerTitle } from './Title';
import { ViewerContent } from './Content';
import { JuiViewerBackground } from 'jui/pattern/ImageViewer';

@observer
class ViewerView extends Component<ViewerViewProps & ViewerViewModelProps> {
  async componentDidMount() {
    await this.props.init();
  }

  render() {
    const { itemId, contentLeftRender, ...rest } = this.props;
    return (
      <JuiViewerBackground data-test-automation-id="Viewer">
        <ViewerTitle
          data-test-automation-id="ViewerTitle"
          itemId={itemId}
          {...rest}
        />
        <ViewerContent
          data-test-automation-id="ViewerContent"
          left={contentLeftRender({ ...rest, itemId })}
          right={<div>commitBlock</div>}
        />
      </JuiViewerBackground>
    );
  }
}

export { ViewerView };
