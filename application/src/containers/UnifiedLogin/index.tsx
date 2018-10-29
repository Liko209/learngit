/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:37:45
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import styled from 'styled-components';
import getUrl from './getUrl';

import EnvSelect from './EnvSelect';
import Download from './Download';
import LoginVersionStatus from '../VersionInfo/LoginVersionStatus';
import { AuthService } from 'sdk/service';
import { JuiModal } from 'jui/components/Dialog';
import { grey } from 'jui/foundation/utils/styles';
import { gitCommitInfo } from '@/containers/VersionInfo/commitInfo';
import { formatDate } from '@/containers/VersionInfo/LoginVersionStatus';
import { isElectron } from '@/utils';

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
const Param = styled.p`
  color: ${grey('700')};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;
interface IProps extends RouteComponentProps<{}> {
  t: TranslationFunction;
}

interface IStates {
  isShowDialog: boolean;
  appVersion: string;
  electronVersion: string;
}

class UnifiedLogin extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
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
    const commitHash = gitCommitInfo.commitInfo[0].commitHash;
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
        {isElectron ? (
          <JuiModal
            open={isShowDialog}
            title={t('About RingCentral')}
            okText={t('Done')}
            onOK={this._handleAboutPage}
          >
            <Param>
              Version: {appVersion} {`(E. ${electronVersion})`}
            </Param>
            <Param>Last Commit: {commitHash}</Param>
            <Param>
              Build Time: {formatDate(process.env.BUILD_TIME || '')}
            </Param>
            <Param>
              Copyright © 1999-
              {new Date().getFullYear()} RingCentral, Inc. All rights reserved.
            </Param>
          </JuiModal>
        ) : null}
      </div>
    );
  }
}

export default translate('login')(UnifiedLogin);
