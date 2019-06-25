/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-29 14:04:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation } from 'react-i18next';
import { JuiModal } from 'jui/components/Dialog';
import { JuiButton } from 'jui/components/Buttons';
import { ElectronUpgradeDialogViewProps, Ref } from './types';

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

  handleUpgrade() {
    if (window.jupiterElectron.onInstallNativeUpgrade) {
      window.jupiterElectron.onInstallNativeUpgrade();
    }
    ElectronUpgradeDialogComponent._portalRef &&
      ElectronUpgradeDialogComponent._portalRef.dismiss();
    ElectronUpgradeDialogComponent._portalRef = null;
  }

  render() {
    const { t } = this.props;

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

    return (
      <JuiModal
        open={true}
        title={t('electron.upgrade.dialogTitle')}
        footer={Upgrade}
        aria-label={t('electron.upgrade.dialogTitle')}
      >
        {t('electron.upgrade.dialogMessage')}
      </JuiModal>
    );
  }
}

const ElectronUpgradeDialogView = withTranslation()(
  ElectronUpgradeDialogComponent,
);

export { ElectronUpgradeDialogView, ElectronUpgradeDialogComponent };
