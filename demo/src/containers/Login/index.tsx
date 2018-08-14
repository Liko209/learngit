/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-02-13 13:50:08
 */
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { service, utils } from 'sdk';

import Button from './Button';
import Download from '../../components/Download';
import Form from './Form';
import Title from './Title';
import Input from './Input';
import Info from './Info';
import LoginVersionStatus from '../Status/LoginVersionStatus';
import { env, betaUserList } from '@/globalConfig';
import ErrorHandler from '@/containers/ErrorHandler';

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
      errors: []
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

  async handleSubmit(event: React.FormEvent<HTMLButtonElement>) {
    event.preventDefault();
    const { username, password, extension } = this.state;
    let errors: string[] = [];
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
      btnText: `Login...`
    });

    try {
      const authService: AuthService = AuthService.getInstance();
      await authService.login({ username, password, extension });
      history.replace((location.state && location.state.from) || '/');
      console.log('history: ', history);
    } catch (error) {
      const handler = new ErrorHandler(error);
      handler.handle({
        [ErrorTypes.INVALID_GRANT]: () => {
          errors.push('Invalid Phone number or password.');
          this.setState({ errors });
        },
        [ErrorTypes.NETWORK]: () => {
          handler.show(error);
        }
      });
    } finally {
      this.setState({
        btnDisabled: false,
        btnText: 'Login'
      });
    }
  }

  render() {
    const {
      username,
      password,
      extension,
      btnDisabled,
      btnText,
      errors
    } = this.state;
    return (
      <div>
        <Form>
          <Title>
            <span>Sign In By Lyman</span>
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
