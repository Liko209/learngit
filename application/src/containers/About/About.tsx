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
import { gitCommitInfo } from '@/containers/VersionInfo/commitInfo';
import { formatDate } from '@/containers/VersionInfo/LoginVersionStatus';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import pkg from '../../../package.json';
import { getGlobalValue } from '@/store/utils';
import { computed } from 'mobx';
import { observer } from 'mobx-react';

type Props = WithNamespaces;
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

  @computed
  get dialogInfo() {
    const isShowDialog = this._globalStore.get(
      GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG,
    );
    const appVersion = this._globalStore.get(GLOBAL_KEYS.APP_VERSION);
    const electronVersion = this._globalStore.get(GLOBAL_KEYS.ELECTRON_VERSION);
    return {
      isShowDialog,
      appVersion,
      electronVersion,
    };
  }

  render() {
    const { t } = this.props;
    const { isShowDialog, appVersion, electronVersion } = this.dialogInfo;
    const commitHash = gitCommitInfo.commitInfo[0].commitHash;
    return (
      <JuiModal
        open={isShowDialog}
        title={t('About RingCentral')}
        okText={t('Done')}
        onOK={this._handleAboutPage}
      >
        <Param>
          Version: {appVersion ? appVersion : pkg.version}{' '}
          {electronVersion ? `(E. ${electronVersion})` : null}
        </Param>
        <Param>Last Commit: {commitHash}</Param>
        <Param>Build Time: {formatDate(process.env.BUILD_TIME || '')}</Param>
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
