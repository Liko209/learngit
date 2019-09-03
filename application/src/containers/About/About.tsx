/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-31 14:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiModal } from 'jui/components/Dialog';
import { grey } from 'jui/foundation/utils/styles';
import styled from 'jui/foundation/styled-components';
import storeManager from '@/store/base/StoreManager';
import { GLOBAL_KEYS } from '@/store/constants';
import pkg from '../../../package.json';
import { getGlobalValue } from '@/store/utils';
import { observable, computed, action } from 'mobx';
import { observer } from 'mobx-react';
import { fetchVersionInfo } from '@/containers/VersionInfo/helper';
import { withEscTracking } from '@/containers/Dialog';

type Props = WithTranslation;

type versionInfoType = {
  deployedTime: string;
  deployedCommit: string;
  deployedVersion: string;
};

const Modal = withEscTracking(JuiModal);
const Param = styled.p`
  color: ${grey('700')};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;

@observer
class About extends Component<Props> {
  private _globalStore = storeManager.getGlobalStore();

  @observable versionInfo: versionInfoType = {
    deployedTime: '',
    deployedCommit: '',
    deployedVersion: '',
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
    const electronVersion = this._globalStore.get(GLOBAL_KEYS.ELECTRON_VERSION);

    return {
      isShowDialog,
      electronAppVersion,
      electronVersion,
    };
  }
  private _handleAboutPage = () => {
    const globalStore = storeManager.getGlobalStore();
    const isSHowDialog = getGlobalValue(GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG);
    globalStore.set(GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG, !isSHowDialog);
  };
  @action
  async fetchVersionInfo() {
    this.versionInfo = await fetchVersionInfo();
  }

  render() {
    const { t } = this.props;
    const {
      isShowDialog,
      electronAppVersion,
      electronVersion,
    } = this.dialogInfo;
    const {
      deployedTime,
      deployedCommit,
      deployedVersion: appVersion,
    } = this.versionInfo;

    return (
      <Modal
        open={isShowDialog}
        title={t('home.aboutRingCentral')}
        okText={t('common.dialog.done')}
        onOK={this._handleAboutPage}
        modalProps={{ 'data-test-automation-id': 'about-page-dialog' }}
      >
        <Param>
          {t('home.version')}: {appVersion ? appVersion : pkg.version}
          {electronAppVersion
            ? ` (E. ${electronVersion} - ${electronAppVersion})`
            : null}
        </Param>
        <Param>
          {t('home.lastCommit')}: {deployedCommit}
        </Param>
        <Param>
          {t('home.deployedTime')}: {deployedTime}
        </Param>
        <Param>
          Copyright © 1999-
          {new Date().getFullYear()} RingCentral, Inc.{' '}
          {t('home.allRightsReserved')}.
        </Param>
      </Modal>
    );
  }
}

const AboutView = withTranslation()(About);
export { AboutView };
