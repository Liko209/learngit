/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-05 13:55:55
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import { translate, WithNamespaces } from 'react-i18next';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { fetchVersionInfo } from './helper';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';

type Props = WithNamespaces;

type versionInfoType = {
  deployTime: string;
  deployCommit: string;
  deployVersion: string;
};

const Wrapper = styled.div`
  position: absolute;
  left: 5px;
  bottom: 50px;
  width: 400px;
`;

const globalStore = storeManager.getGlobalStore();

@observer
class LoginVersionStatusView extends React.Component<Props> {
  @observable versionInfo: versionInfoType = {
    deployTime: '',
    deployCommit: '',
    deployVersion: '',
  };

  constructor(props: any) {
    super(props);
    this.fetchVersion();
  }

  @action
  async fetchVersion() {
    this.versionInfo = await fetchVersionInfo();
    this.versionInfo.deployVersion &&
      globalStore.set(
        GLOBAL_KEYS.APP_VERSION,
        this.versionInfo.deployVersion || '',
      );
  }

  render() {
    const { t } = this.props;
    const { deployVersion, deployCommit, deployTime } = this.versionInfo;

    const version = `${t('home.version')}: ${deployVersion} ${deployCommit}`;
    const time = `${t('home.deployTime')}: ${deployTime}`;

    return (
      <Wrapper>
        <div>{version}</div>
        <div>{time}</div>
      </Wrapper>
    );
  }
}

const LoginVersionStatus = translate('translations')(LoginVersionStatusView);

export default LoginVersionStatus;
