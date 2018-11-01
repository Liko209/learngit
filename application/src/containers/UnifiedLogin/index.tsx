/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:37:45
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { translate, WithNamespaces } from 'react-i18next';
import styled from 'styled-components';
import getUrl from './getUrl';

import EnvSelect from './EnvSelect';
import Download from './Download';
import LoginVersionStatus from '../VersionInfo/LoginVersionStatus';
import { AuthService } from 'sdk/service';
import { AboutPageView } from '../AboutPage';

const Form = styled.form`
  width: 300px;
  height: 450px;
  position: absolute;
  margin: auto;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const Button = styled.button`
  display: block;
  width: 100%;
  color: #fff;
  background-color: #007bff;
  border-color: 1px solid #007bff;
  font-size: 1.5rem;
  margin-top: 1em;
  padding: 0.625rem;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  &:hover {
    background-color: #0069d9;
    border-color: 1px solid #0062cc;
  }
  &:focus {
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);
  }
  &[disabled] {
    background-color: #007bff;
    border-color: #007bff;
    opacity: 0.65;
  }
`;

type Props = RouteComponentProps<{}> & WithNamespaces;

interface IStates {
  isShowDialog: boolean;
  appVersion: string;
  electronVersion: string;
}

class UnifiedLogin extends React.Component<Props, IStates> {
  constructor(props: Props) {
    super(props);
    this._checkIfLogin();
  }
  state = {
    isShowDialog: false,
    appVersion: '',
    electronVersion: '',
  };

  private _checkIfLogin() {
    const authService: AuthService = AuthService.getInstance();
    if (authService.isLoggedIn()) {
      const { history } = this.props;
      history.replace('/messages');
    }
  }
  private _handleAboutPage = (
    event?: React.MouseEvent<HTMLElement>,
    vApp?: string,
    vElectron?: string,
  ) => {
    const { isShowDialog } = this.state;
    this.setState({
      isShowDialog: !isShowDialog,
      appVersion: vApp || '',
      electronVersion: vElectron || '',
    });
  }

  // onChange = (event: React.FormEvent<HTMLSelectElement>) => {
  //   this.setState({ brandId: event.currentTarget.value });
  // }

  onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const { location } = this.props;
    window.location.href = getUrl(location);
  }

  render() {
    const { t } = this.props;
    window.jupiterElectron = {
      ...window.jupiterElectron,
      handleAboutPage: this._handleAboutPage,
    };
    const { isShowDialog, appVersion, electronVersion } = this.state;
    return (
      <div>
        <Form onSubmit={this.onSubmit}>
          <Button type="submit" data-anchor="btnLogin">
            {t('signIn')}
          </Button>
          {/* <select onChange={this.onChange} value={brandId} style={{ display: 'none' }}>
            <option value="1210">RC US</option>
            <option value="3610">CA</option>
            <option value="2010">EU</option>
            <option value="3710">UK</option>
            <option value="5010">AU</option>
            <option value="3420">AT&T</option>
            <option value="7310">TELUS</option>
          </select> */}
          <EnvSelect />
          <a
            target="_blank"
            href="https://wiki.ringcentral.com/display/XTO/Jupiter+test+account"
          >
            Test Account
          </a>
        </Form>
        <LoginVersionStatus />
        <Download />
        <AboutPageView
          isShowDialog={isShowDialog}
          appVersion={appVersion}
          electronVersion={electronVersion}
          handleAboutPage={this._handleAboutPage}
        />
      </div>
    );
  }
}

export default translate('login')(UnifiedLogin);
