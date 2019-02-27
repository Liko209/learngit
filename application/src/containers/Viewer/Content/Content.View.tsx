/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiResponsiveLayout, withResponsive, VISUAL_MODE } from 'jui/foundation/Layout/Responsive';
import { ViewerContentViewProps } from './types';
import { viewerType } from '../types';
const CONTENT_VIEWER = {
  imageViewer: () => <div>imageViewer</div>,
};

const factory = (viewerType: viewerType) => {
  const Component = CONTENT_VIEWER[viewerType];
  return <Component />;
};

const LeftResponsive = withResponsive(props => props.children, {
  minWidth: 480,
});

const RightResponsive = withResponsive(() => <div>commitBlock</div>, {
  visualMode: VISUAL_MODE.BOTH,
  enable: {
    left: true,
  },
});

@observer
class ViewerContentViewComponent extends Component<WithNamespaces & ViewerContentViewProps> {
  render() {
    const { viewerType } = this.props;
    return (
      <JuiResponsiveLayout>
        <LeftResponsive>{factory(viewerType)}</LeftResponsive>
        <RightResponsive />
      </JuiResponsiveLayout>
    );
  }
}

const ViewerContentView = translate('translations')(ViewerContentViewComponent);

export { ViewerContentView };
