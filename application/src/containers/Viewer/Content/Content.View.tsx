/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, ReactElement } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import {
  JuiResponsiveLayout,
  withResponsive,
  VISUAL_MODE,
} from 'jui/foundation/Layout/Responsive';
import { ViewerContentViewProps } from './types';
type ResponsiveProps = {
  content: ReactElement;
};

const LeftResponsive = withResponsive(
  (props: ResponsiveProps) => {
    return React.cloneElement(props.content);
  },
  {
    minWidth: 480,
  },
);

const RightResponsive = withResponsive(
  (props: ResponsiveProps) => {
    return React.cloneElement(props.content);
  },
  {
    visualMode: VISUAL_MODE.BOTH,
    enable: {
      left: true,
    },
  },
);

@observer
class ViewerContentViewComponent extends Component<
  WithNamespaces & ViewerContentViewProps
> {
  render() {
    return (
      <JuiResponsiveLayout>
        <LeftResponsive content={this.props.left} />
        <RightResponsive content={this.props.right} />
      </JuiResponsiveLayout>
    );
  }
}

const ViewerContentView = translate('translations')(ViewerContentViewComponent);

export { ViewerContentView };
