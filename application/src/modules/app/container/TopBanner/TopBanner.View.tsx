/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-04 15:57:48
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { JuiTopBannerContainer } from 'jui/pattern/TopBanner';
import { config, ConfigType } from './register';
import _ from 'lodash';
import { observer } from 'mobx-react';

@observer
class TopBannerView extends React.Component {
  render() {
    const children = _(config)
      .orderBy('priority', 'desc')
      .map(({ priority, Component }: ConfigType) => {
        return <Component key={priority} />;
      })
      .value();
    return <JuiTopBannerContainer>{children}</JuiTopBannerContainer>;
  }
}

export { TopBannerView };
