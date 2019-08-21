/*
 * @Author: isaac.liu
 * @Date: 2019-05-28 16:53:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Route, withRouter } from 'react-router-dom';
import { container } from 'framework/ioc';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { PhoneTabRouter } from './PhoneTabRouter';
import { PhoneTabProps } from './types';
import history from '@/history';

@observer
class PhoneTabComponent extends Component<PhoneTabProps> {
  async componentDidMount() {
    const canUseTelephony = await container
      .get(FeaturesFlagsService)
      .canUseTelephony();
    if (!canUseTelephony) {
      history.replace('/messages');
    }
  }
  render() {
    return (
      <Route
        path={`${this.props.match.path}/:subPath?`}
        component={PhoneTabRouter}
      />
    );
  }
}

const PhoneTab = withRouter(PhoneTabComponent);

export { PhoneTab };
