/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-04 15:57:48
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { JuiTopBannerContainer } from 'jui/pattern/TopBanner';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { TopBannerViewProps } from './types';
import { TopBannerViewModel } from './TopBanner.ViewModel';

@observer
class TopBannerView extends React.Component<TopBannerViewProps> {
  render() {
    const children = _(TopBannerViewModel.data)
      .orderBy('priority', 'asc')
      .map(({ priority, Component, props, isShow }) => {
        return isShow ? <Component key={priority} {...props} /> : null;
      })
      .value();
    return <JuiTopBannerContainer>{children}</JuiTopBannerContainer>;
  }
}

export { TopBannerView };
