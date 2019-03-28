/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, ReactElement } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { withResponsive, VISUAL_MODE } from 'jui/foundation/Layout/Responsive';
import { ViewerContentViewProps } from './types';
import { JuiImageViewerContent } from 'jui/pattern/ImageViewer';
type ResponsiveProps = {
  content: ReactElement;
};

const LeftResponsive = withResponsive((props: ResponsiveProps) => {
  return React.cloneElement(props.content);
},                                    {});

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
  WithTranslation & ViewerContentViewProps
> {
  render() {
    return (
      <JuiImageViewerContent>
        <LeftResponsive content={this.props.left} />
        <RightResponsive content={this.props.right} />
      </JuiImageViewerContent>
    );
  }
}

const ViewerContentView = withTranslation('translations')(
  ViewerContentViewComponent,
);

export { ViewerContentView };
