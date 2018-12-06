/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-04 15:57:48
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { StyledTopBannerContainer } from 'jui/pattern/TopBanner';
import { config, ConfigType } from './register';
import _ from 'lodash';

class TopBannerView extends React.Component {
  render() {
    const children = _(config)
      .orderBy('priority', 'desc')
      .map(({ priority, Component }: ConfigType) => {
        return <Component key={priority} />;
      })
      .value();
    return <StyledTopBannerContainer>{children}</StyledTopBannerContainer>;
  }
}

export { TopBannerView };
