/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-05 13:55:55
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { fetchVersionInfo } from './helper';

type Props = WithTranslation;

type versionInfoType = {
  deployedTime: string;
  deployedCommit: string;
  deployedVersion: string;
};

const Wrapper = styled.div`
  position: absolute;
  left: 5px;
  bottom: 50px;
  width: 400px;
`;

@observer
class LoginVersionStatusView extends React.Component<Props> {
  @observable versionInfo: versionInfoType = {
    deployedTime: '',
    deployedCommit: '',
    deployedVersion: '',
  };

  constructor(props: any) {
    super(props);
    this.fetchVersion();
  }

  @action
  async fetchVersion() {
    this.versionInfo = await fetchVersionInfo();
  }

  render() {
    const { t } = this.props;
    const { deployedVersion, deployedCommit, deployedTime } = this.versionInfo;

    const version = `${t(
      'home.version',
    )}: ${deployedVersion} ${deployedCommit}`;
    const time = `${t('home.deployedTime')}: ${deployedTime}`;

    return (
      <Wrapper>
        <div>{version}</div>
        <div>{time}</div>
      </Wrapper>
    );
  }
}

const LoginVersionStatus = withTranslation('translations')(
  LoginVersionStatusView,
);

export default LoginVersionStatus;
