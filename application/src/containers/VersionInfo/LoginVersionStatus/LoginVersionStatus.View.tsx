/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-09 17:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from 'styled-components';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import isElectron from '@/common/isElectron';
import { LoginVersionStatusViewProps } from './types';

type Props = LoginVersionStatusViewProps & WithTranslation;

const Wrapper = styled.div`
  position: absolute;
  left: 5px;
  bottom: 50px;
  width: 400px;
`;

@observer
class LoginVersionStatus extends React.Component<Props> {
  render() {
    const { t } = this.props;
    const {
      deployedVersion,
      deployedCommit,
      deployedTime,
    } = this.props.versionInfo;
    const {
      electronVersion,
      electronAppVersion,
    } = this.props.electronVersionInfo;

    let version = `${t('home.version')}: ${deployedVersion}`;
    if (isElectron && electronVersion) {
      version += ` (E. ${electronVersion} - ${electronAppVersion})`;
    }
    const lastCommit = `${t('home.lastCommit')}: ${deployedCommit}`;
    const time = `${t('home.deployedTime')}: ${deployedTime}`;

    return (
      <Wrapper>
        <div>{version}</div>
        <div>{lastCommit}</div>
        <div>{time}</div>
      </Wrapper>
    );
  }
}

const LoginVersionStatusView = withTranslation('translations')(
  LoginVersionStatus,
);

export { LoginVersionStatusView };
