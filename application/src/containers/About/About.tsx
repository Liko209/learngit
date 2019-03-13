/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-31 14:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiModal } from 'jui/components/Dialog';
import { grey } from 'jui/foundation/utils/styles';
import styled from 'jui/foundation/styled-components';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import pkg from '../../../package.json';
import { getGlobalValue } from '@/store/utils';
import { observable, computed, action } from 'mobx';
import { observer } from 'mobx-react';
import { fetchVersionInfo } from '@/containers/VersionInfo/helper';

type Props = WithNamespaces;

type versionInfoType = {
  deployTime: string;
  deployCommit: string;
  deployVersion: string;
};

const Param = styled.p`
  color: ${grey('700')};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;

@observer
class About extends Component<Props> {
  private _globalStore = storeManager.getGlobalStore();

  private _handleAboutPage = () => {
    const globalStore = storeManager.getGlobalStore();
    const isSHowDialog = getGlobalValue(GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG);
    globalStore.set(GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG, !isSHowDialog);
  }

  @observable versionInfo: versionInfoType = {
    deployTime: '',
    deployCommit: '',
    deployVersion: '',
  };

  constructor(props: any) {
    super(props);
    this.fetchVersionInfo();
  }

  @computed
  get dialogInfo() {
    const isShowDialog = this._globalStore.get(
      GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG,
    );

    const electronAppVersion = this._globalStore.get(
      GLOBAL_KEYS.ELECTRON_APP_VERSION,
    );
    return {
      isShowDialog,
      electronAppVersion,
    };
  }

  @action
  async fetchVersionInfo() {
    this.versionInfo = await fetchVersionInfo();
    const globalStore = storeManager.getGlobalStore();
    this.versionInfo.deployVersion &&
      globalStore.set(
        GLOBAL_KEYS.APP_VERSION,
        this.versionInfo.deployVersion || '',
      );
  }

  render() {
    const { t } = this.props;
    const { isShowDialog, electronAppVersion } = this.dialogInfo;
    const {
      deployTime,
      deployCommit,
      deployVersion: appVersion,
    } = this.versionInfo;

    return (
      <JuiModal
        open={isShowDialog}
        title={t('home.aboutRingCentral')}
        okText={t('common.dialog.done')}
        onOK={this._handleAboutPage}
      >
        <Param>
          {t('home.version')}: {appVersion ? appVersion : pkg.version}{' '}
          {electronAppVersion ? `(E. ${electronAppVersion})` : null}
        </Param>
        <Param>
          {t('home.lastCommit')}: {deployCommit}
        </Param>
        <Param>
          {t('home.deployTime')}: {deployTime || ''}
        </Param>
        <Param>
          Copyright © 1999-
          {new Date().getFullYear()} RingCentral, Inc. All rights reserved.
        </Param>
      </JuiModal>
    );
  }
}

const AboutView = translate('translations')(About);
export { AboutView };
