/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-30 15:37:43
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import {
  JuiSnackbarContent,
  JuiSnackbarAction,
} from 'jui/components/Snackbars';
import { observer } from 'mobx-react';
import { ToastType } from '@/containers/ToastWrapper/Toast/types';
import { ElectronUpgradeBannerViewProps } from './types';
import { withTranslation } from 'react-i18next';

@observer
class ElectronUpgradeBannerViewComponent extends React.Component<
  ElectronUpgradeBannerViewProps
> {
  render() {
    const { t, downloadUrl } = this.props;
    return (
      <JuiSnackbarContent
        type={ToastType.WARN}
        message={t('electron.upgrade.topBannerWarning')}
        messageAlign="center"
        fullWidth={true}
        action={
          <JuiSnackbarAction
            aria-label={t('electron.upgrade.upgrade')}
            component="a"
            download={true}
            href={downloadUrl}
          >
            {t('electron.upgrade.upgrade')}
          </JuiSnackbarAction>
        }
      />
    );
  }
}

const ElectronUpgradeBannerView = withTranslation()(
  ElectronUpgradeBannerViewComponent,
);

export { ElectronUpgradeBannerView };
