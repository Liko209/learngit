/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-05 13:55:55
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { fetchVersionInfo } from './helper';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';

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
class LoginVersionStatus extends React.Component {
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
    const { deployVersion, deployTime } = this.versionInfo;

    const version = `Version: ${deployVersion}`;
    const time = `Deploy Time: ${deployTime}`;

    return (
      <Wrapper>
        <div>{version}</div>
        <div>{time}</div>
      </Wrapper>
    );
  }
}

export default LoginVersionStatus;
