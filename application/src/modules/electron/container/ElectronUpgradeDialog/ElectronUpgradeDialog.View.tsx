/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-29 14:04:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation } from 'react-i18next';
import { JuiModal } from 'jui/components/Dialog';
import { JuiButton } from 'jui/components/Buttons';
import {
  ElectronUpgradeDialogViewProps,
  UpgradeType,
  UpgradeUserAction,
} from './types';
import { TopBannerViewModel } from '@/modules/app/container/TopBanner/TopBanner.ViewModel';
import { ElectronUpgradeBanner } from '@/modules/app/container/TopBanner/Banners/ElectronUpgradeBanner';
import { iframeDownloader } from '@/utils/download';

type Ref = {
  dismiss: (afterDismiss?: (() => void) | undefined) => void;
};

class ElectronUpgradeDialogComponent extends React.Component<
  ElectronUpgradeDialogViewProps
> {
  static _portalRef: null | Ref = null;

  static setPortalRef(ref: Ref) {
    ElectronUpgradeDialogComponent._portalRef = ref;
  }

  static getPortalRef() {
    return ElectronUpgradeDialogComponent._portalRef;
  }

  private _close(userAction?: UpgradeUserAction) {
    if (window.jupiterElectron.handleUpgradeFeedback) {
      window.jupiterElectron.handleUpgradeFeedback(userAction);
    }
    ElectronUpgradeDialogComponent._portalRef &&
      ElectronUpgradeDialogComponent._portalRef.dismiss();
    ElectronUpgradeDialogComponent._portalRef = null;
  }

  handleOk = () => {
    this._close();
  }
  handleUpgrade = () => {
    iframeDownloader('downloadInstaller', this.props.url);
    this._close();
  }
  handleIgnoreOnce = () => {
    TopBannerViewModel.showBanner(ElectronUpgradeBanner, {
      downloadUrl: this.props.url,
    });
    this._close({ snooze: true });
  }
  handleNotNow = () => {
    this._close({ snooze: true });
  }
  handleIgnore = () => {
    this._close({ skip: true });
  }
  render() {
    const { t, needUpgrade, type, snooze } = this.props;
    const buttons = [];
    const IgnoreOnce = (
      <JuiButton
        onClick={this.handleIgnoreOnce}
        color="primary"
        autoFocus={false}
        key="ignore"
        aria-label={t('electron.upgrade.ignoreOnce')}
      >
        {t('electron.upgrade.ignoreOnce')}
      </JuiButton>
    );
    const Upgrade = (
      <JuiButton
        onClick={this.handleUpgrade}
        color="primary"
        autoFocus={false}
        key="upgrade"
        aria-label={t('electron.upgrade.upgrade')}
      >
        {t('electron.upgrade.upgrade')}
      </JuiButton>
    );
    const NotNow = (
      <JuiButton
        onClick={this.handleNotNow}
        color="primary"
        autoFocus={false}
        key="not-now"
        aria-label={t('electron.upgrade.notNow')}
      >
        {t('electron.upgrade.notNow')}
      </JuiButton>
    );
    const Ignore = (
      <JuiButton
        onClick={this.handleIgnore}
        color="primary"
        autoFocus={false}
        key="ignore"
        aria-label={t('electron.upgrade.ignore')}
      >
        {t('electron.upgrade.ignore')}
      </JuiButton>
    );
    const Ok = (
      <JuiButton
        onClick={this.handleOk}
        color="primary"
        autoFocus={false}
        key="ok"
        aria-label={t('electron.upgrade.noUpgradeDialogOk')}
      >
        {t('electron.upgrade.noUpgradeDialogOk')}
      </JuiButton>
    );
    if (needUpgrade) {
      if (type === UpgradeType.FORCE && !snooze) {
        buttons.push(IgnoreOnce);
      } else if (type === UpgradeType.SOFT) {
        buttons.push(NotNow);
        buttons.push(Ignore);
      }
      buttons.push(Upgrade);
    } else {
      buttons.push(Ok);
    }
    return (
      <JuiModal
        open={true}
        title={t(
          needUpgrade
            ? 'electron.upgrade.dialogTitle'
            : 'electron.upgrade.noUpgradeDialogTitle',
        )}
        footer={<>{[...buttons]}</>}
        aria-label={t(
          needUpgrade
            ? 'electron.upgrade.dialogTitle'
            : 'electron.upgrade.noUpgradeDialogTitle',
        )}
      >
        {needUpgrade
          ? t('electron.upgrade.dialogMessage')
          : t('electron.upgrade.noUpgradeDialogMessage')}
      </JuiModal>
    );
  }
}

const ElectronUpgradeDialogView = withTranslation()(
  ElectronUpgradeDialogComponent,
);

export { ElectronUpgradeDialogView, ElectronUpgradeDialogComponent };
