/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-02-13 13:50:08
 */
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { service, utils } from 'sdk';
import ErrorHandle from '@/containers/ErrorHandle';

import Button from './Button';
import Download from '../../components/Download';
import Form from './Form';
import Title from './Title';
import Input from './Input';
import Info from './Info';
import LoginVersionStatus from '../Status/LoginVersionStatus';
import { env, betaUserList } from '@/globalConfig';

const { AuthService } = service;
const { ErrorTypes } = utils;
interface Props extends RouteComponentProps<any> { }

interface States {
  btnDisabled: boolean;
  btnText: string;
  username: string;
  extension: string;
  password: string;
  errors: string[];
}

class Login extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      btnDisabled: false,
      btnText: 'Login',
      username: '',
      extension: '',
      password: '',
      errors: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    this.setState({ [name]: value } as Pick<
      States,
      'username' | 'extension' | 'password'
      >);
  }

  handleSubmit(event: React.FormEvent<HTMLButtonElement>) {
    event.preventDefault();
    const { username, password, extension } = this.state;
    const errors: string[] = [];
    if (!username) {
      errors.push('Phone number can not be empty.');
    }
    if (!password) {
      errors.push('Password can not be empty.');
    }
    if (
      env === 'production' &&
      !betaUserList.some(uname => username.indexOf(uname) > -1)
    ) {
      alert('Invalid account');
      return;
    }
    if (errors.length > 0) {
      this.setState({ errors });
      return;
    }
    const { location, history } = this.props;
    this.setState({
      btnDisabled: true,
      btnText: `Login...`,
    });

    AuthService.getInstance<AuthService>()
      .login({ username, password, extension })
      .then(() => {
        history.replace((location.state && location.state.from) || '/');
        console.log('history: ', history);
      })
      .catch((error: any) => {
        this.setState({
          btnDisabled: false,
          btnText: 'Login',
        });
        if (error.code === ErrorTypes.INVALID_GRANT) {
          errors.push('Invalid Phone number or password.');
          this.setState({ errors });
        } else {
          const errorHandle = new ErrorHandle(error);
          errorHandle.show();
        }
      });
  }

  render() {
    const {
      username,
      password,
      extension,
      btnDisabled,
      btnText,
      errors,
    } = this.state;
    return (
      <div>
        <Form>
          <Title>
            <span>Sign In</span>
          </Title>
          <Input
            name="username"
            onChange={this.handleChange}
            value={username}
            placeholder="Phone number"
          />
          <Input
            name="extension"
            onChange={this.handleChange}
            value={extension}
            placeholder="Extension"
          />
          <Input
            name="password"
            type="password"
            onChange={this.handleChange}
            value={password}
            placeholder="Password"
          />
          <Button onClick={this.handleSubmit} disabled={btnDisabled}>
            {btnText}
          </Button>
          <Info>
            <ul>{errors.map(error => <li key={error}>{error}</li>)}</ul>
          </Info>
        </Form>
        <Download />
        <LoginVersionStatus />
      </div>
    );
  }
}

export default Login;
