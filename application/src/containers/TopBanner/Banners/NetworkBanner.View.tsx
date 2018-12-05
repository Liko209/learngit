/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-05 10:08:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiSnackbarContent } from 'jui/components/Snackbars';
import { NetworkBannerViewProps } from './types';
import { t } from 'i18next';

class NetworkBannerView extends React.Component<NetworkBannerViewProps> {
  render() {
    const config = this.props.config;
    return config.shouldShow ? (
      <JuiSnackbarContent
        type={config.type}
        messageAlign={'center'}
        fullWidth={true}
        message={t(config.message)}
      />
    ) : null;
  }
}

export { NetworkBannerView };
