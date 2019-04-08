/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Route, withRouter } from 'react-router-dom';

import { SettingRouter } from './SettingRouter';
import { SettingViewProps } from './types';

@observer
class SettingComponent extends Component<SettingViewProps> {
  render() {
    return (
      <Route
        path={`${this.props.match.path}/:subPath?`}
        component={SettingRouter}
      />
    );
  }
}

const Setting = withRouter(SettingComponent);

export { Setting };
