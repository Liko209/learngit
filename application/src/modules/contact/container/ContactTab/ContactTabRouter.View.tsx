/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-21 19:49:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ListLayout } from '@/modules/common/container/Layout';

import { ContactTabViewProps } from './types';
import { ContactTabs } from './config';

@observer
class ContactTabRouterView extends Component<ContactTabViewProps> {
  render() {
    const { updateCurrentUrl } = this.props;

    return (
      <ListLayout config={ContactTabs} updateCurrentUrl={updateCurrentUrl} />
    );
  }
}

export { ContactTabRouterView };
