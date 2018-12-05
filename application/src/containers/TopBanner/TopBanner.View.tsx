/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-04 15:57:48
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { config, ConfigType } from './register';
import styled from 'jui/src/foundation/styled-components';
import _ from 'lodash';

const JuiTopBanner = styled.div`
  position: relative;
  max-height: 48px;
  overflow: hidden;
`;

class TopBannerView extends React.Component {
  render() {
    const children = _(config)
      .orderBy('priority', 'desc')
      .map(({ priority, Component }: ConfigType) => {
        return <Component key={priority} />;
      })
      .value();
    return <JuiTopBanner>{children}</JuiTopBanner>;
  }
}

export { TopBannerView };
