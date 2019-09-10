/*
 * @Author: isaac.liu
 * @Date: 2019-07-08 09:57:17
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ComponentType } from 'react';
import { notificationCenter, SERVICE } from 'sdk/service';

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { GLIP_LOGIN_STATUS } from 'sdk/framework/account';
import { LoginInfo } from 'sdk/types';

const withRCMode = (hide: boolean = true) =>
  function<P>(Comp: ComponentType<P>): any {
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    type State = {
      glipLoginSuccess: boolean;
    };

    return class extends Component<P, State> {
      private _handleGlipLogin = (loginInfo: LoginInfo) => {
        this.setState({
          glipLoginSuccess: loginInfo.success,
        });
      };
      constructor(props: P) {
        super(props);
        this.state = {
          glipLoginSuccess:
            accountService.getGlipLoginStatus() === GLIP_LOGIN_STATUS.SUCCESS,
        };

        notificationCenter.on(SERVICE.GLIP_LOGIN, this._handleGlipLogin);
      }

      componentWillUnmount() {
        notificationCenter.off(SERVICE.GLIP_LOGIN, this._handleGlipLogin);
      }

      render() {
        const { glipLoginSuccess } = this.state;
        if (!glipLoginSuccess && hide) {
          return null;
        }
        return <Comp {...this.props as P} />;
      }
    };
  };

export { withRCMode };
