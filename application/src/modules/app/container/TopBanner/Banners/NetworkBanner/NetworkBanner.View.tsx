/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-05 10:08:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation } from 'react-i18next';
import { JuiSnackbarContent } from 'jui/components/Snackbars';
import { observer } from 'mobx-react';
import { ToastType } from '@/containers/ToastWrapper/Toast/types';
import { NetworkBannerViewProps } from './types';

@observer
class NetworkBannerViewComponent extends React.Component<
  NetworkBannerViewProps
> {
  render() {
    const { t, isShow } = this.props;

    return isShow ? (
      <JuiSnackbarContent
        type={ToastType.ERROR}
        message={t('common.prompt.NoInternetConnection')}
        messageAlign="center"
        fullWidth={true}
      />
    ) : null;
  }
}

const NetworkBannerView = withTranslation()(NetworkBannerViewComponent);
export { NetworkBannerView };
