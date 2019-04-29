/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:31:06
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { AccountService } from 'sdk/module/account';

import { AppEnvSetting } from 'sdk/module/env';

import Config from '@/config';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

type Props = {};
type States = {
  value: string;
  environments: string[];
};

class EnvSelect extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
    const value = Config.getEnv();
    const environments = Config.getAllEnv();
    this.state = { value, environments };
    this.changeHandler = this.changeHandler.bind(this);
  }

  render() {
    const Options = this.state.environments.map(envName => (
      <option key={envName} value={envName} label={envName}>
        {envName}
      </option>
    ));

    return (
      <select value={this.state.value} onChange={this.changeHandler}>
        {Options}
      </select>
    );
  }

  changeHandler(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    AppEnvSetting.switchEnv(value, accountService);
    this.setState({ value });
    location.reload();
  }
}

export default EnvSelect;
