/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-30 10:25:13
 * Copyright © RingCentral. All rights reserved.
 */
import { RouteComponentProps } from 'react-router-dom';
import { computed } from 'mobx';

import { AuthService } from 'sdk/service';
import { AbstractViewModel } from '@/base';

type RouteComponent =
  | React.StatelessComponent<RouteComponentProps<{}>>
  | React.ComponentClass<any>;

class PrivateRouteViewModel extends AbstractViewModel {
  private _authService: AuthService = AuthService.getInstance();
  component: RouteComponent;

  @computed
  get isAuthenticated() {
    return this._authService.isLoggedIn();
  }

  onReceiveProps({ component }: { component: RouteComponent }) {
    this.component = component;
  }
}

export { PrivateRouteViewModel };
