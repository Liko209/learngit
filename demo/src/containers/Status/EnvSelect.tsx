import * as React from 'react';
import { service } from 'sdk';
import { globalConfig } from '@/globalConfig';

type Props = {};
type States = {
  value: string;
  environments: string[];
};

const { ConfigService } = service;

class EnvSelect extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
    const configService: ConfigService = ConfigService.getInstance();
    const value = configService.getEnv() || 'XMN-Stable';
    const environments = Object.keys(globalConfig).filter(
      envName => envName !== 'default',
    );
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
    const configService: ConfigService = ConfigService.getInstance();
    configService.switchEnv(value);
    this.setState({ value });
    location.reload();
  }
}

export default EnvSelect;
