/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-08-03 13:59:53
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AccountService } from 'sdk/module/account';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

interface IProps extends RouteComponentProps<any> {}

class Login extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this._checkIfLogin();
  }

  private _checkIfLogin() {
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    if (accountService.isLoggedIn()) {
      const { history } = this.props;
      history.replace('/messages');
    }
  }
  onClick() {
    const { location, history } = this.props;
    localStorage.setItem('login', 'true'); // todo
    history.replace((location.state && location.state.from) || '/');
  }

  render() {
    return (
      <div>
        login page
        <button onClick={this.onClick} type='button'>
          Login
        </button>
      </div>
    );
  }
}

export default Login;
