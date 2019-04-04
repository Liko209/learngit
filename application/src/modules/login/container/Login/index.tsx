/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-08-03 13:59:53
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AccountService } from 'sdk/module/account';
interface IProps extends RouteComponentProps<any> {}

interface IStates {
  btnDisabled: boolean;
  btnText: string;
  username: string;
  extension: string;
  password: string;
  errors: string[];
}

class Login extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      btnDisabled: false,
      btnText: 'Login',
      username: '',
      extension: '',
      password: '',
      errors: [],
    };
    this.onClick = this.onClick.bind(this);
    this._checkIfLogin();
  }

  private _checkIfLogin() {
    const accountService = AccountService.getInstance();
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
        <button onClick={this.onClick}>Login</button>
      </div>
    );
  }
}

export default Login;
