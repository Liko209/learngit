/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-30 10:25:13
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { AuthService } from 'sdk/service';
import { StoreViewModel } from '@/store/ViewModel';
import { PrivateRouteProps, PrivateRouteViewProps } from './types';

class PrivateRouteViewModel extends StoreViewModel<PrivateRouteProps>
  implements PrivateRouteViewProps {
  private _authService: AuthService = AuthService.getInstance();
  component: PrivateRouteProps['component'];

  constructor(props: PrivateRouteProps) {
    super(props);
    const { component } = props;
    this.component = component;
  }

  @computed
  get isAuthenticated() {
    return this._authService.isLoggedIn();
  }
}

export { PrivateRouteViewModel };
