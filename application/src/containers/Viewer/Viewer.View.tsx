/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ViewerViewProps } from './types';
import {
  JuiDialogTitleWithAction,
  JuiDialogContentWithFill,
} from 'jui/components/Dialog';
import { ViewerTitle } from './Title';
import { ViewerContent } from './Content';

@observer
class ViewerView extends Component<ViewerViewProps> {
  render() {
    const { itemId, containComponent } = this.props;
    return (
      <>
        <JuiDialogTitleWithAction data-test-automation-id="ViewerTitle">
          <ViewerTitle itemId={itemId} />
        </JuiDialogTitleWithAction>
        <JuiDialogContentWithFill data-test-automation-id="ViewerContent">
          <ViewerContent itemId={itemId} containComponent={containComponent} />
        </JuiDialogContentWithFill>
      </>
    );
  }
}

export { ViewerView };
