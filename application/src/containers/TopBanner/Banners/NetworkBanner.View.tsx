/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-05 10:08:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { WithNamespaces } from 'react-i18next';
import { JuiSnackbarContent } from 'jui/components/Snackbars';
import { NetworkBannerViewProps, NetworkBannerProps } from './types';

type Props = WithNamespaces & NetworkBannerProps & NetworkBannerViewProps;

class NetworkBannerView extends React.Component<Props> {
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
