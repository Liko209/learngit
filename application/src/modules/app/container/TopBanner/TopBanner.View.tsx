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
import { container } from 'framework/ioc';
import { AppStore } from '../../store';

@observer
class TopBannerView extends React.Component<TopBannerViewProps> {
  private _appStore: AppStore = container.get(AppStore);
  render() {
    const children = _(this._appStore.topBanners)
      .orderBy('priority', 'asc')
      .map(({
        priority, Component, props, isShow,
      }) => (isShow ? <Component key={priority} {...props} /> : null))
      .value();
    return <JuiTopBannerContainer>{children}</JuiTopBannerContainer>;
  }
}

export { TopBannerView };
