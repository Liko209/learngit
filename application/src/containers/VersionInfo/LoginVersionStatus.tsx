/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-05 13:55:55
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';
import { fetchVersionInfo } from './helper';
import isElectron from '@/common/isElectron';
import { GLOBAL_KEYS } from '@/store/constants';
import { storeManager } from '@/store';

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
  private _globalStore = storeManager.getGlobalStore();

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

  @computed
  get electronVersionInfo() {
    const electronAppVersion = this._globalStore.get(
      GLOBAL_KEYS.ELECTRON_APP_VERSION,
    );
    const electronVersion = this._globalStore.get(GLOBAL_KEYS.ELECTRON_VERSION);

    return {
      electronAppVersion,
      electronVersion,
    };
  }

  render() {
    const { t } = this.props;
    const { deployedVersion, deployedCommit, deployedTime } = this.versionInfo;
    const { electronVersion, electronAppVersion } = this.electronVersionInfo;

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

const LoginVersionStatus = withTranslation('translations')(
  LoginVersionStatusView,
);

export default LoginVersionStatus;
