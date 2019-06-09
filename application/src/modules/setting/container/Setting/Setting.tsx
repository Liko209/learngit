/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 17:49:41
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter, RouteComponentProps, Route } from 'react-router-dom';
import { SettingRouter } from '../SettingRouter';

@observer
class SettingComponent extends Component<RouteComponentProps> {
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
